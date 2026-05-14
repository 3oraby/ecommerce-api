const PaymentMethod = require("../../enums/paymentMethod.enum");
const Payment = require("../orders/payment.model");
const Order = require("../orders/order.model");

exports.checkDuplicatePayment = async (transactionId, paymobOrderId) => {
  const { Op } = require("sequelize");
  return await Payment.findOne({
    where: {
      [Op.or]: [
        { transaction_id: transactionId ? transactionId.toString() : null },
        { paymob_order_id: paymobOrderId ? paymobOrderId.toString() : null },
      ]
    }
  });
};

exports.findPaymentByPaymobOrMerchantOrder = async (paymobOrderId, merchantOrderId) => {
  let payment = null;
  if (merchantOrderId) {
    payment = await Payment.findOne({ where: { order_id: merchantOrderId } });
  }
  if (!payment && paymobOrderId) {
    payment = await Payment.findOne({ where: { paymob_order_id: paymobOrderId } });
  }
  return payment;
};

exports.completePayment = async (id, data, transaction = null) => {
  return await Payment.update({
    status: "COMPLETED",
    ...data
  }, { where: { id }, transaction });
};

exports.failPayment = async (id, transaction = null) => {
  return await Payment.update({
    status: "FAILED"
  }, { where: { id }, transaction });
};

exports.updateOrderStatus = async (orderId, status, transaction = null) => {
  return await Order.update({ status }, {
    where: { id: orderId },
    transaction,
  });
};

exports.findOrderById = async (orderId) => {
  return await Order.findByPk(orderId);
};

exports.clearActiveCartByUserId = async (userId, transaction = null) => {
  const { Cart } = require("../cart/cart.model");
  return await Cart.update(
    { status: "ORDERED" },
    { where: { user_id: userId, status: "ACTIVE" }, transaction }
  );
};

exports.getAvailablePaymentMethods = async () => {
  const methods = [
    { code: PaymentMethod.COD, name: "Cash On Delivery", enabled: true },
    { code: PaymentMethod.VISA, name: "Visa / Mastercard", enabled: true },
    { code: PaymentMethod.MOBILE_WALLET, name: "Mobile Wallet", enabled: true },
    { code: PaymentMethod.FAWRY, name: "Fawry", enabled: true },
  ];
  
  return methods.filter((m) => m.enabled);
};
