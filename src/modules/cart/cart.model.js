const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const { Product } = require("../products/products.model");
const CartStatus = require("../../enums/cartStatus.enum");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(CartStatus.ACTIVE, CartStatus.ORDERED),
      allowNull: false,
      defaultValue: CartStatus.ACTIVE,
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "cart_items",
    timestamps: true,
    createdAt: "added_at", 
    updatedAt: "updated_at",
  }
);

Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(CartItem, { foreignKey: "product_id" });

module.exports = { Cart, CartItem };
