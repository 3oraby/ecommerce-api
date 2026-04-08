const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const bcrypt = require("bcrypt");
const Roles = require("../../enums/roles.enum");
const AccountStatus = require("../../enums/accountStatus.enum");

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
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    deletedAt: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);

          user.password_changed_at = new Date(Date.now() - 1000);
        }
      },
    },

    defaultScope: {
      attributes: { exclude: ["password"] },
    },
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
