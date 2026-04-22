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
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Payment;
