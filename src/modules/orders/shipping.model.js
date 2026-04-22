const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const ShippingStatus = require("../../enums/shippingStatus.enum");

const Shipping = sequelize.define(
  "Shipping",
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
    status: {
      type: DataTypes.ENUM(Object.values(ShippingStatus)),
      defaultValue: ShippingStatus.PENDING,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    canceled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "shippings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Shipping;
