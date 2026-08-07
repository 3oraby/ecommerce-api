const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const app = require("./app");
const sequelize = require("./config/sequelize");
const { connectRedis } = require("./config/redis");
const queueService = require("./services/queue/queue.service");
const {
  startNotificationConsumer,
} = require("./services/notifications/notification.consumer");

connectRedis();

sequelize
  .authenticate()
  .then(() => logger.info("DB connection successful"))
  .catch((err) => logger.error("Unable to connect to DB:", err));

queueService
  .connect()
  .then(() => {
    logger.info("RabbitMQ connection initialized.");
    return startNotificationConsumer();
  })
  .catch((err) => logger.error("Failed to initialize RabbitMQ:", err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

const gracefulShutdown = async () => {
  logger.info("Starting graceful shutdown...");
  try {
    await queueService.close();
    await sequelize.close();
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = sequelize;
