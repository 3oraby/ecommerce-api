const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");

exports.signup = asyncHandler(async (req, res, next) => {
  const { user, accessToken } = await authService.signupService(req, res, next);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "User created successfully",
    accessToken,
    data: user,
  });
});
