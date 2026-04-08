const userRepository = require("./user.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

class UserService {
  async createUser(userData) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError("Email is already in use", HttpStatus.Conflict);
    }

    return await userRepository.createUser(userData);
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError("User not found", HttpStatus.NotFound);
    }
    return user;
  }

  async getCurrentUser(id) {
    // Wrapper for retrieving current user details
    return this.getUserById(id);
  }

  async updateUser(id, updateData) {
    // Check if email is updated and unique
    if (updateData.email) {
      const existingUser = await userRepository.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== Number(id)) {
        throw new ApiError("Email is already in use", HttpStatus.Conflict);
      }
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    if (!updatedUser) {
      throw new ApiError("User not found", HttpStatus.NotFound);
    }
    return updatedUser;
  }

  async deleteUser(id) {
    const result = await userRepository.deleteUser(id);
    if (!result) {
      throw new ApiError("User not found", HttpStatus.NotFound);
    }
    return result;
  }
}

module.exports = new UserService();
