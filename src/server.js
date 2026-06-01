const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const sequelize = require("./config/sequelize");
const { connectRedis } = require("./config/redis");
const queueService = require("./services/queue/queue.service");
const { startNotificationConsumer } = require("./services/notifications/notification.consumer");

connectRedis();

sequelize
  .authenticate()
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error("Unable to connect to DB:", err));

queueService.connect()
  .then(() => {
    console.log("RabbitMQ connection initialized.");
    return startNotificationConsumer();
  })
  .catch((err) => console.error("Failed to initialize RabbitMQ:", err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const gracefulShutdown = async () => {
  console.log("Starting graceful shutdown...");
  try {
    await queueService.close();
    await sequelize.close();
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = sequelize;
