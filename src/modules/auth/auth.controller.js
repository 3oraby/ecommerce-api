const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const { sendCookies } = require("./cookie.service");

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await authService.signupService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "OTP has been sent to your email, please verify it to login",
    data: user,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { user, accessToken, refreshToken } =
    await authService.loginService(req);

  sendCookies(res, refreshToken);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "User logged in successfully",
    accessToken,
    data: user,
  });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const result = await authService.verifyEmailService(req);
  const { user, accessToken, refreshToken } = result;

  sendCookies(res, refreshToken);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Email verified successfully",
    accessToken,
    data: user,
  });
});
