const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await authService.signupService(req, res, next);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "OTP has been sent to your email, please verify it to login",
    data: user,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { user, accessToken } = await authService.loginService(req, res, next);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "User logged in successfully",
    accessToken,
    data: user,
  });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const result = await authService.verifyEmailService(req, res, next);
  const { user, accessToken } = result;

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Email verified successfully",
    accessToken,
    data: user,
  });
});
