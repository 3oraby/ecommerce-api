const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const { Product } = require("../products/products.model");

const Favorite = sequelize.define(
  "Favorite",
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "favorites",
    timestamps: false,
  }
);

Favorite.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(Favorite, { foreignKey: "product_id" });

module.exports = Favorite;
