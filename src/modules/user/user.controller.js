const userService = require("./user.service");
const HttpStatus = require("../../enums/httpStatus");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

// --- ADMIN ONLY ---
exports.createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "User created successfully",
    data: { user },
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: { users },
    results: users.length,
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: { user },
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "User updated successfully",
    data: { user },
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "User deleted successfully",
  });
});

// --- ANY USER ---
exports.getMe = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: { user },
  });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Your profile updated successfully",
    data: { user },
  });
});

exports.deleteMe = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Your profile deleted successfully",
  });
});
