const winston = require("winston");
const { getRequestContext } = require("../context/requestContext");

const addRequestContext = winston.format((info) => {
    const context = getRequestContext();

    if (context?.requestId) {
        info.requestId = context.requestId;
    }

    if (context?.userId) {
        info.userId = context.userId;
    }

    return info;
});

exports.consoleFormat = winston.format.combine(
    addRequestContext(),
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length
                ? JSON.stringify(meta)
                : ""
        }`;
    })
);

exports.fileFormat = winston.format.combine(
    addRequestContext(),
    winston.format.timestamp(),
    winston.format.json()
);