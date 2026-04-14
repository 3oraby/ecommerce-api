const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/apiError");
const crypto = require("crypto");
const HttpStatus = require("../../enums/httpStatus.enum");
const {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  createResetPasswordPayload,
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
    createAccessTokenPayload(user),
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES_IN,
  );
};

exports.generateRefreshToken = (user) => {
  const jti = generateJTI();

  const refreshToken = generateJWT(
    createRefreshTokenPayload(user, jti),
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

exports.generatePasswordResetToken = (user) => {
  const payload = createResetPasswordPayload(user);
  const secret = process.env.JWT_RESET_SECRET + user.password;
  return generateJWT(payload, secret, process.env.JWT_RESET_EXPIRES_IN);
};

exports.verifyPasswordResetToken = (token, user) => {
  const secret = process.env.JWT_RESET_SECRET + user.password;
  try {
    return verifyJwt(token, secret);
  } catch (err) {
    if (err.statusCode === HttpStatus.Unauthorized) {
      err.message = err.message.includes("expired")
        ? "Reset token expired. Please request a new one."
        : "Invalid or already used reset token.";
      throw err;
    }
    throw new ApiError(
      "Invalid or already used reset token.",
      HttpStatus.Unauthorized,
    );
  }
};
