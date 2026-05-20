const ordersRepository = require("./orders.repository");
const cartRepository = require("../cart/cart.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const OrderStatus = require("../../enums/orderStatus.enum");
const addressesRepository = require("../addresses/addresses.repository");
const shippingStatus = require("../../enums/shippingStatus.enum");
const PaymentStatus = require("../../enums/paymentStatus.enum");
const paymobService = require("../../services/paymob/paymob.service");
const PaymentMethod = require("../../enums/paymentMethod.enum");
const centralNotificationService = require("../../services/notifications/notification.service");
const NotificationTypes = require("../../enums/notificationTypes.enum");

exports.checkout = async (userId, addressId, paymentMethod, walletPhone) => {
  const address = await addressesRepository.findByIdAndUser(addressId, userId);

  if (!address) {
    throw new ApiError(
      "Address not found or does not belong to user",
      HttpStatus.FORBIDDEN,
    );
  }

  const cart = await cartRepository.getCartWithItems(userId);

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError("Cart is empty", HttpStatus.BadRequest);
  }

  let total = 0;
  const itemsData = [];

  for (const item of cart.items) {
    if (!item.product) {
      throw new ApiError(
        `Product not found for item ${item.id}`,
        HttpStatus.NotFound,
      );
    }

    if (item.quantity > item.product.stock) {
      throw new ApiError(
        `Not enough stock for product ${item.product.name}`,
        HttpStatus.BadRequest,
      );
    }

    const price = item.product.price;
    total += parseFloat(price) * item.quantity;

    itemsData.push({
      product_id: item.product.id,
      quantity: item.quantity,
      price: price,
    });
  }

  const isCOD = paymentMethod === "COD";

  if (isCOD) {
    const orderData = {
      user_id: userId,
      total,
      address_id: addressId,
      status: OrderStatus.PENDING,
      items: itemsData,
      payment: {
        amount: total,
        method: paymentMethod,
        status: PaymentStatus.PENDING,
      },
      shipping: {
        status: shippingStatus.PENDING,
      },
    };
    const order = await ordersRepository.processCheckout(
      cart.id,
      orderData,
      true,
    );

    await centralNotificationService.sendNotification(userId, {
      title: "Order Created",
      body: `Your COD order #${order.id} has been created successfully.`,
      type: NotificationTypes.ORDER_CREATED,
      data: { orderId: order.id },
    });
    
    // Notify sellers
    const sellerIds = [...new Set(cart.items.map(item => item.product.seller_id))];
    for (const sellerId of sellerIds) {
      if (sellerId) {
        await centralNotificationService.sendNotification(sellerId, {
          title: "New Order Received",
          body: `You have a new order (Order #${order.id}) containing your products.`,
          type: NotificationTypes.NEW_ORDER,
          data: { orderId: order.id },
        });
      }
    }

    return { order };
  }

  const token = await paymobService.authenticate();

  const amountCents = Math.round(total * 100);
  const paymobItems = itemsData.map((item) => ({
    name: `Product ${item.product_id}`,
    amount_cents: Math.round(item.price * 100),
    description: "E-commerce Item",
    quantity: item.quantity,
  }));

  const merchantOrderId = `CART_${cart.id}_ADDR_${addressId}_${Date.now()}`;
  const paymobOrder = await paymobService.createOrder(
    token,
    amountCents,
    merchantOrderId,
    paymobItems,
  );

  const billingData = {
    first_name: "Customer",
    last_name: "Customer",
    email: "customer@example.com",
    phone_number: walletPhone || "01000000000",
    apartment: "NA",
    floor: "NA",
    street: "NA",
    building: "NA",
    city: "NA",
    country: "EG",
  };

  switch (paymentMethod) {
    case PaymentMethod.VISA:
      const paymentKey = await paymobService.createPaymentKey(
        token,
        paymobOrder.id,
        amountCents,
        paymobService.cardIntegrationId,
        billingData,
      );
      const paymentUrl = paymobService.generateIframeUrl(paymentKey);
      return { payment_url: paymentUrl };
    case PaymentMethod.MOBILE_WALLET:
      if (!paymobService.walletIntegrationId)
        throw new ApiError(
          "Mobile wallet integration not configured",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      if (!walletPhone)
        throw new ApiError(
          "Wallet phone is required for MOBILE_WALLET",
          HttpStatus.BAD_REQUEST,
        );
      const walletPaymentKey = await paymobService.createPaymentKey(
        token,
        paymobOrder.id,
        amountCents,
        paymobService.walletIntegrationId,
        billingData,
      );
      const walletResponse = await paymobService.generateWalletUrl(
        walletPaymentKey,
        walletPhone,
      );
      if (!walletResponse.redirect_url)
        throw new ApiError(
          "Failed to generate wallet URL, check wallet phone number or try another payment method",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      return { redirect_url: walletResponse.redirect_url };
  }
};

exports.cancelOrder = async (userId, orderId) => {
  const order = await ordersRepository.findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", HttpStatus.NotFound);
  }

  if (order.user_id !== userId) {
    throw new ApiError(
      "You are not authorized to cancel this order",
      HttpStatus.Forbidden,
    );
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new ApiError(
      "Only PENDING orders can be canceled",
      HttpStatus.BadRequest,
    );
  }

  await ordersRepository.cancelOrder(orderId);
  
  await centralNotificationService.sendNotification(userId, {
    title: "Order Canceled",
    body: `Your order #${order.id} has been canceled.`,
    type: NotificationTypes.ORDER_CANCELED,
    data: { orderId: order.id },
  });
  
  return { success: true };
};

exports.getMyOrders = async (userId, filters) => {
  return await ordersRepository.findUserOrders(userId, filters);
};

exports.getMyCanceledOrders = async (userId, filters) => {
  filters.parsedFilters = {
    ...filters.parsedFilters,
    status: OrderStatus.CANCELED,
  };
  return await ordersRepository.findUserOrders(userId, filters);
};

exports.updateOrderStatusAdmin = async (orderId, newStatus) => {
  const order = await ordersRepository.findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", HttpStatus.NotFound);
  }

  if (order.status === OrderStatus.CANCELED) {
    throw new ApiError("Cannot update a canceled order", HttpStatus.BadRequest);
  }

  const validTransitions = {
    [OrderStatus.PENDING]: [OrderStatus.SHIPPED, OrderStatus.CANCELED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
    [OrderStatus.DELIVERED]: [],
  };

  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new ApiError(
      `Invalid transition from ${order.status} to ${newStatus}`,
      HttpStatus.BadRequest,
    );
  }

  await ordersRepository.updateOrderStatus(orderId, newStatus);
  
  if (newStatus === OrderStatus.SHIPPED) {
    await centralNotificationService.sendNotification(order.user_id, {
      title: "Order Shipped",
      body: `Your order #${order.id} is now on its way!`,
      type: NotificationTypes.ORDER_SHIPPED,
      data: { orderId: order.id },
    });
  } else if (newStatus === OrderStatus.DELIVERED) {
    await centralNotificationService.sendNotification(order.user_id, {
      title: "Order Delivered",
      body: `Your order #${order.id} has been delivered successfully.`,
      type: NotificationTypes.ORDER_DELIVERED,
      data: { orderId: order.id },
    });
  }
};

exports.getSellerOrders = async (sellerId, filters) => {
  const orders = await ordersRepository.findSellerOrders(sellerId, filters);

  if (!orders.data || orders.total === 0) {
    return {
      total: 0,
      page: 1,
      limit: filters?.parsedPagination?.limit || 10,
      data: [],
    };
  }

  return orders;
};

exports.getOrderById = async (orderId, userId, role) => {
  const order = await ordersRepository.findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", HttpStatus.NotFound);
  }

  if (role === "CUSTOMER" && order.user_id !== userId) {
    throw new ApiError(
      "You are not authorized to access this order",
      HttpStatus.Forbidden,
    );
  }

  if (role === "SELLER") {
    const hasSellerProducts = order.items.some(
      (item) => item.product.seller_id === userId,
    );
    if (!hasSellerProducts) {
      throw new ApiError(
        "You are not authorized to access this order",
        HttpStatus.Forbidden,
      );
    }
  }

  return order;
};

exports.getOrderSummary = async (orderId, userId, role) => {
  const order = await module.exports.getOrderById(orderId, userId, role);
  return {
    orderId: order.id,
    total: order.total,
    itemCount: order.items.length,
    status: order.status,
    paymentMethod: order.payment.method,
    paymentStatus: order.payment.status,
    shippingStatus: order.shipping.status,
  };
};
