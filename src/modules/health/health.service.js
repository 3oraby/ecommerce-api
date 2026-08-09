const sequelize = require("../../config/sequelize");
const { redisClient } = require("../../config/redis");
const queueService = require("../../services/queue/queue.service");

const checkDatabase = async () => {
  try {
    await sequelize.authenticate();

    return {
      status: "ok",
    };
  } catch (error) {
    return {
      status: "error",
    };
  }
};

const checkRedis = async () => {
  try {
    if (!redisClient.isReady) {
      return {
        status: "error",
      };
    }

    await redisClient.ping();

    return {
      status: "ok",
    };
  } catch (error) {
    return {
      status: "error",
    };
  }
};

const checkRabbitMQ = async () => {
  try {
    const isHealthy = queueService.isHealthy();

    return {
      status: isHealthy ? "ok" : "error",
    };
  } catch (error) {
    return {
      status: "error",
    };
  }
};

const checkHealth = async () => {
  const start = Date.now();

  const [database, redis, rabbitmq] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkRabbitMQ(),
  ]);

  const checks = {
    database,
    redis,
    rabbitmq,
  };

  const isHealthy = Object.values(checks).every(
    (check) => check.status === "ok",
  );

  const responseTime = Date.now() - start;

  return {
    status: isHealthy ? "ok" : "degraded",

    checks,

    meta: {
      pid: process.pid,
      uptime: Math.floor(process.uptime()),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version ?? "unknown",
      nodeVersion: process.version,
    },
  };
};

module.exports = {
  checkHealth,
};
