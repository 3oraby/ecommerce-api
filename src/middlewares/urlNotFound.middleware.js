const ApiError = require("../utils/apiError");
const HttpStatus = require("../enums/httpStatus.enum");

const urlNotFoundMiddleware = (req, res, next) => {
  next(
    new ApiError(
      `Cannot find ${req.originalUrl} on this server!`,
      HttpStatus.NotFound,
    ),
  );
};

module.exports = urlNotFoundMiddleware;
