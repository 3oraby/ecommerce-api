const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");

const SellerProfile = sequelize.define(
  "SellerProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    store_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    business_info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_store_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "seller_profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: false,
  }
);

// We would normally define associations here or in an index file
// User.hasOne(SellerProfile, { foreignKey: "user_id" })
// SellerProfile.belongsTo(User, { foreignKey: "user_id" })

module.exports = SellerProfile;
