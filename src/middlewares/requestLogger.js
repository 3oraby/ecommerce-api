const crypto = require("node:crypto");
const logger = require("../logger");

const { requestContext } = require("../context/requestContext");

const requestLogger = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  
  requestContext.run({ requestId }, () => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;

      logger.info("HTTP Request", {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }); 

    next();
  });
};

module.exports = requestLogger;
