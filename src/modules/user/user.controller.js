const userService = require("./user.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const { sanitizeUser } = require("./user.utils");
const { clearCookies } = require("../auth/cookie.service");

// --- ADMIN ONLY ---
exports.createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUserService(req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "User created successfully",
    data: sanitizeUser(user),
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsersService();

  const sanitizedUsers = users.map((user) => sanitizeUser(user));

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: sanitizedUsers,
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserByIdService(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: sanitizeUser(user),
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUserByIdService(req.params.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "User updated successfully",
    data: sanitizeUser(user),
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    throw new ApiError(
      "Wrong Route! Use /api/v1/users/me to delete your profile",
      HttpStatus.BadRequest,
    );
  }

  await userService.deleteUserByIdService(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "User deleted successfully",
  });
});

// --- ANY USER ---
exports.getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserByIdService(req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: sanitizeUser(user),
  });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateUserByIdService(req.user.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Your profile updated successfully",
    data: sanitizeUser(user),
  });
});

exports.deleteMe = asyncHandler(async (req, res) => {
  await userService.deleteMeService(req.user.id);

  clearCookies(res);
  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Your profile deleted successfully",
  });
});
