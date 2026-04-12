const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

const verifyJwt = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(
        "Token expired. Please log in again.",
        HttpStatus.Unauthorized,
      );
    }
    if (err.name === "JsonWebTokenError") {
      throw new ApiError(
        "Invalid token. Please log in again.",
        HttpStatus.Unauthorized,
      );
    }
    throw err;
  }
};

exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

exports.verifyAccessToken = (token) => {
  return verifyJwt(token, process.env.JWT_ACCESS_SECRET);
};

exports.verifyRefreshToken = (token) => {
  return verifyJwt(token, process.env.JWT_REFRESH_SECRET);
};
