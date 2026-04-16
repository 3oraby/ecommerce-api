const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const Country = require("../countries/countries.model");

const State = sequelize.define(
  "State",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "states",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: false,
    indexes: [
      {
        fields: ["country_id"],
      },
      {
        unique: true,
        fields: ["country_id", "name"],
      },
    ],
  }
);

State.belongsTo(Country, { foreignKey: "country_id", as: "country" });
Country.hasMany(State, { foreignKey: "country_id", as: "states" });

module.exports = State;
