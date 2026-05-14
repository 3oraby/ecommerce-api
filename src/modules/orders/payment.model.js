const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const PaymentMethod = require("../../enums/paymentMethod.enum");
const PaymentStatus = require("../../enums/paymentStatus.enum");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM(Object.values(PaymentMethod)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(Object.values(PaymentStatus)),
      defaultValue: PaymentStatus.PENDING,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymob_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymob_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_key: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Payment;
