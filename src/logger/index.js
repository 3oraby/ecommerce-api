const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { consoleFormat, fileFormat } = require("./formats");

const logger = winston.createLogger({
  level: "info",

  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",

      maxFiles: "30d",

      format: fileFormat,
    }),

    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",

      maxFiles: "90d",
      format: fileFormat,
    }),
  ],
});

module.exports = logger;
