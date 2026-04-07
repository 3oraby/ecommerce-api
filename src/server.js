const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  },
);

sequelize
  .authenticate()
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error("Unable to connect to DB:", err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = sequelize;
