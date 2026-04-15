const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const { sendCookies, clearCookies } = require("./cookie.service");
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

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  await authService.forgotPasswordService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Password reset code sent to your email",
  });
});

exports.verifyResetOtp = asyncHandler(async (req, res, next) => {
  const { resetToken } = await authService.verifyResetOtpService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "OTP verified successfully",
    resetToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  await authService.resetPasswordService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Password reset successfully, now you can login",
  });
});

exports.resendPasswordResetOtp = asyncHandler(async (req, res, next) => {
  await authService.resendPasswordResetOtpService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "A new password reset code has been sent to your email",
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  await authService.logoutService(req);

  clearCookies(res);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Logged out successfully",
  });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const meta = getRequestMeta(req);
  const { accessToken, refreshToken } = await authService.refreshTokenService(
    req,
    meta,
  );

  sendCookies(res, refreshToken);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Token refreshed successfully",
    accessToken,
  });
});
