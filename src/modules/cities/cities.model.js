const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const State = require("../states/states.model");

const City = sequelize.define(
  "City",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "cities",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: false,
    indexes: [
      {
        fields: ["state_id"],
      },
      {
        unique: true,
        fields: ["state_id", "name"],
      },
    ],
  }
);

City.belongsTo(State, { foreignKey: "state_id", as: "state" });
State.hasMany(City, { foreignKey: "state_id", as: "cities" });

module.exports = City;
