const HttpStatus = require("../enums/httpStatus.enum");
const ApiError = require("../utils/apiError");
const multer = require("multer");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(HttpStatus.InternalServerError).json({
      status: "Error",
      message: "Something went very wrong!",
    });
  }
};

const handleMulterError = (err) => {
  let message = "File upload error";

  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size is too large";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    message = `Invalid file field '${err.field}'`;
  }

  return new ApiError(message, HttpStatus.BadRequest);
};

const handleTableNotFound = (err) => {
  const message = `Resource not found`;
  return new ApiError(message, HttpStatus.NotFound);
};

const handleDatabaseError = (err) => {
  const message = err.original?.sqlMessage || "";

  if (message.includes("Unknown column")) {
    const match = message.match(/Unknown column '(.+?)'/);
    const field = match ? match[1].split(".").pop() : "unknown";

    return new ApiError(
      `Invalid field: '${field}' is not allowed`,
      HttpStatus.BadRequest,
    );
  }

  if (message.includes("foreign key constraint fails")) {
    return new ApiError(
      "Invalid reference: related resource not found",
      HttpStatus.BadRequest,
    );
  }

  return new ApiError(
    "Database error occurred",
    HttpStatus.InternalServerError,
  );
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HttpStatus.InternalServerError;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    let error = Object.create(err);

    if (error instanceof multer.MulterError) {
      error = handleMulterError(error);
    }

    if (error.parent && error.parent.errno === 1146)
      error = handleTableNotFound(error);

    if (error.name === "SequelizeDatabaseError")
      error = handleDatabaseError(error);

    return sendErrorProd(error, res);
  }

  console.log("Error handling middleware called outside dev/prod environment");
};

module.exports = globalErrorHandler;
