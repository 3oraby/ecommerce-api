const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const User = require("../user/user.model");

const NotificationToken = sequelize.define(
  "NotificationToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "notification_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

User.hasMany(NotificationToken, { foreignKey: "user_id", as: "notificationTokens" });
NotificationToken.belongsTo(User, { foreignKey: "user_id" });

module.exports = NotificationToken;
