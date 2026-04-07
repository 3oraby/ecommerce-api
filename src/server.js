const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const sequelize = require("./config/sequelize");

sequelize
  .authenticate()
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error("Unable to connect to DB:", err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = sequelize;
