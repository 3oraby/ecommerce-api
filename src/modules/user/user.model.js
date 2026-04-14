const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const Roles = require("../../enums/roles.enum");
const AccountStatus = require("../../enums/accountStatus.enum");
const { hashPassword } = require("../../utils/password.util");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(Roles.ADMIN, Roles.CUSTOMER, Roles.SELLER),
      defaultValue: Roles.CUSTOMER,
    },
    password_changed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    account_status: {
      type: DataTypes.ENUM(
        AccountStatus.ACTIVE,
        AccountStatus.UNVERIFIED,
        AccountStatus.SUSPENDED,
        AccountStatus.INACTIVE,
      ),
      defaultValue: AccountStatus.UNVERIFIED,
    },
    email_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email_otp_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_otp_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await hashPassword(user.password);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password) {
          user.password = await hashPassword(user.password);

          user.password_changed_at = new Date(Date.now() - 1000);
        }
      },
    },

    // defaultScope: {
    //   attributes: { exclude: ["password"] },
    // },
  },
);

User.prototype.changedPasswordAfter = function (JWTTimestamp) {
  if (this.password_changed_at) {
    const changedTimestamp = parseInt(
      this.password_changed_at.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = User;
