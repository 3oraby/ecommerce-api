const userRepository = require("./user.repository");
const authRepository = require("../auth/auth.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

exports.createUserService = async (userData) => {
  const existingUser = await userRepository.findByEmailWithDeleted(
    userData.email,
  );
  if (existingUser && !existingUser?.deleted_at) {
    throw new ApiError("Email is already in use", HttpStatus.Conflict);
  }

  if (existingUser && existingUser?.deleted_at) {
    throw new ApiError(
      "This account was deleted. Please restore your account instead of creating a new one.",
      HttpStatus.Conflict,
    );
  }

  return await userRepository.createUser(userData);
};

exports.getAllUsersService = async () => {
  return await userRepository.findAll();
};

exports.getUserByIdService = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError("User not found", HttpStatus.NotFound);
  }
  return user;
};

exports.updateUserByIdService = async (id, updateData) => {
  if (updateData.password) {
    throw new ApiError(
      "wrong route, you can not update password",
      HttpStatus.BadRequest,
    );
  }

  if (updateData.email) {
    throw new ApiError(
      "wrong route, you can not update email",
      HttpStatus.BadRequest,
    );
  }

  const updatedUser = await userRepository.updateUserById(id, updateData);
  if (!updatedUser) {
    throw new ApiError("User not found", HttpStatus.NotFound);
  }
  return updatedUser;
};

exports.deleteUserByIdService = async (id) => {
  const result = await userRepository.deleteUserById(id);
  if (!result) {
    throw new ApiError("User not found", HttpStatus.NotFound);
  }

  if (result.deleted_at) {
    throw new ApiError("User not found", HttpStatus.NotFound);
  }

  if (result.role === Roles.ADMIN) {
    throw new ApiError("You can not delete admin", HttpStatus.BadRequest);
  }

  await authRepository.revokeAllUserSessions(id);
  return result;
};

exports.deleteMeService = async (id) => {
  const result = await userRepository.deleteUserById(id);
  if (!result) {
    throw new ApiError("User not found", HttpStatus.NotFound);
  }

  await authRepository.revokeAllUserSessions(id);
  return result;
};
