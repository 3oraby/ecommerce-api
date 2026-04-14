const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const { sendCookies } = require("./cookie.service");
const { sanitizeUser } = require("../user/user.utils");

const getRequestMeta = (req) => {
  return {
    device_info: req.headers["user-agent"],
    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  };
};

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await authService.signupService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "OTP has been sent to your email, please verify it to login",
    data: sanitizeUser(user),
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const meta = getRequestMeta(req);
  const { user, accessToken, refreshToken } = await authService.loginService(
    req,
    meta,
  );

  sendCookies(res, refreshToken);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "User logged in successfully",
    accessToken,
    data: sanitizeUser(user),
  });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const meta = getRequestMeta(req);
  const result = await authService.verifyEmailService(req, meta);
  const { user, accessToken, refreshToken } = result;

  sendCookies(res, refreshToken);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Email verified successfully",
    accessToken,
    data: sanitizeUser(user),
  });
});

exports.resendEmailVerification = asyncHandler(async (req, res, next) => {
  const user = await authService.resendEmailVerificationService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Verification code sent successfully",
    data: sanitizeUser(user),
  });
});

