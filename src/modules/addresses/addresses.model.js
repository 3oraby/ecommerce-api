const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const User = require("../user/user.model");
const Country = require("../countries/countries.model");
const State = require("../states/states.model");
const City = require("../cities/cities.model");

const Address = sequelize.define(
  "Address",
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
    address_line1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: false,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["user_id", "is_default"],
      },
    ],
  }
);

Address.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });

Address.belongsTo(Country, { foreignKey: "country_id", as: "country" });
Country.hasMany(Address, { foreignKey: "country_id", as: "addresses" });

Address.belongsTo(State, { foreignKey: "state_id", as: "state" });
State.hasMany(Address, { foreignKey: "state_id", as: "addresses" });

Address.belongsTo(City, { foreignKey: "city_id", as: "city" });
City.hasMany(Address, { foreignKey: "city_id", as: "addresses" });

module.exports = Address;
