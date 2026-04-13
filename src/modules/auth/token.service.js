const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/apiError");
const crypto = require("crypto");
const HttpStatus = require("../../enums/httpStatus.enum");
const {
  createAccessPayload,
  createRefreshPayload,
} = require("./token.payload");

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

const generateJWT = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const generateJTI = () => {
  return crypto.randomUUID();
};

exports.generateAccessToken = (user) => {
  return generateJWT(
    createAccessPayload(user),
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES_IN,
  );
};

exports.generateRefreshToken = (user) => {
  const jti = generateJTI();

  const refreshToken = generateJWT(
    createRefreshPayload(user, jti),
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN,
  );

  return { refreshToken, jti };
};

exports.verifyAccessToken = (token) => {
  return verifyJwt(token, process.env.JWT_ACCESS_SECRET);
};

exports.verifyRefreshToken = (token) => {
  return verifyJwt(token, process.env.JWT_REFRESH_SECRET);
};

exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
