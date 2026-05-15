const paymentsRepository = require("./payments.repository");
const paymobService = require("../../services/paymob/paymob.service");
const PaymentStatus = require("../../enums/paymentStatus.enum");
const OrderStatus = require("../../enums/orderStatus.enum");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const cacheKeyBuilder = require("../../services/cache/cacheKeys.util");
const { cacheOrFetch } = require("../../services/cache/cache.helper");
const cartRepository = require("../cart/cart.repository");
const ordersRepository = require("../orders/orders.repository");

exports.handleWebhook = async (queryData, hmac) => {
  try {
    if (!queryData || !queryData.obj) {
      throw new ApiError("Invalid payload structure", HttpStatus.BAD_REQUEST);
    }

    const isValid = paymobService.verifyWebhookHmac(queryData, hmac);
    if (!isValid) {
      console.warn("Invalid HMAC signature");
      throw new ApiError("Invalid HMAC signature", HttpStatus.UNAUTHORIZED);
    }

    const { obj } = queryData;
    const success = obj.success;
    const transactionId = obj.id;
    const paymobOrderId = obj.order.id;
    const merchantOrderId = obj.order.merchant_order_id;
    const pending = obj.pending;
    const amountCents = obj.amount_cents;

    const existingPayment = await paymentsRepository.checkDuplicatePayment(
      transactionId,
      paymobOrderId,
    );

    if (existingPayment) {
      return { success: true, message: "Webhook already processed" };
    }

    if (!success || pending) {
      return { success: true, message: "Payment failed/pending" };
    }

    if (!merchantOrderId || !merchantOrderId.startsWith("CART_")) {
      console.warn(
        "Invalid or missing merchant_order_id format",
        merchantOrderId,
      );
      return {
        success: true,
        message: "Webhook ignored due to invalid merchant_order_id format",
      };
    }

    const match = merchantOrderId.match(/CART_(\d+)_ADDR_(\d+)/);
    if (!match) {
      console.warn("Invalid merchant order ID format", merchantOrderId);
      return {
        success: true,
        message: "Webhook ignored due to invalid merchant_order_id format",
      };
    }

    const cartId = match[1];
    const addressId = match[2];

    const cart = await cartRepository.getCartWithItemsById(cartId);
    if (!cart || !cart.items || cart.items.length === 0) {
      console.warn("Cart is empty or not active, ignoring webhook");
      return { success: true, message: "Cart already processed or invalid" };
    }

    let total = 0;
    const itemsData = [];
    for (const item of cart.items) {
      if (!item.product) continue;
      total += parseFloat(item.product.price) * item.quantity;
      itemsData.push({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    let finalMethod = "VISA";
    const subType = obj.source_data?.sub_type || obj.source_data?.type || "";
    if (subType.toLowerCase() === "wallet") finalMethod = "MOBILE_WALLET";
    else if (subType.toLowerCase() === "fawry") finalMethod = "FAWRY";

    const orderData = {
      user_id: cart.user_id,
      total,
      address_id: addressId,
      status: OrderStatus.PENDING,
      items: itemsData,
      payment: {
        amount: total,
        method: finalMethod,
        status: PaymentStatus.COMPLETED,
        transaction_id: transactionId.toString(),
        paymob_order_id: paymobOrderId.toString(),
        paymob_payment_id: transactionId.toString(),
        paid_at: new Date(),
      },
      shipping: {
        status: "PENDING",
      },
    };

    await ordersRepository.processCheckout(cartId, orderData, true);

    return {
      success: true,
      message: "Payment processed and order created successfully",
    };
  } catch (error) {
    console.log("error: ", error);
    throw new ApiError(
      "Failed to process webhook",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

exports.getPaymentMethods = async () => {
  const key = cacheKeyBuilder.paymentMethods();

  return cacheOrFetch(
    key,
    async () => {
      return await paymentsRepository.getAvailablePaymentMethods();
    },
    "48h",
  );
};
