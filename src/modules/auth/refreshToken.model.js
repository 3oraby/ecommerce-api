const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");

const RefreshToken = sequelize.define(
  "RefreshToken",
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

    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    jti: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    device_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = RefreshToken;
