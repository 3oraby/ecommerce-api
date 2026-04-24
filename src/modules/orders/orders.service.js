const ordersRepository = require("./orders.repository");
const cartRepository = require("../cart/cart.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const OrderStatus = require("../../enums/orderStatus.enum");
const addressesRepository = require("../addresses/addresses.repository");
const shippingStatus = require("../../enums/shippingStatus.enum");
const PaymentStatus = require("../../enums/paymentStatus.enum");

exports.checkout = async (userId, addressId, paymentMethod) => {
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

  const order = await ordersRepository.processCheckout(cart.id, orderData);

  return order;
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
