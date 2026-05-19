exports.templates = {
  ORDER_CREATED: (data) => ({
    title: "Order Received",
    body: `Your order #${data.orderId} has been successfully created.`,
  }),
  ORDER_SHIPPED: (data) => ({
    title: "Order Shipped",
    body: `Good news! Your order #${data.orderId} is on its way.`,
  }),
  PAYMENT_SUCCESS: (data) => ({
    title: "Payment Successful",
    body: `We have received your payment for order #${data.orderId}.`,
  }),
};
