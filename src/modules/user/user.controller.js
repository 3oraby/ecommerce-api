const userService = require("./user.service");
const AppError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus");

class UserController {
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);

      // Exclude password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(HttpStatus.Created).json({
        status: "success",
        data: { user: userResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(HttpStatus.OK).json({
        status: "success",
        results: users.length,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);

      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(HttpStatus.OK).json({
        status: "success",
        data: { user: userResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      if (!userId) {
        throw new AppError(
          "Authentication required to get user details",
          HttpStatus.Unauthorized,
        );
      }
      const user = await userService.getCurrentUser(userId);

      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(HttpStatus.OK).json({
        status: "success",
        data: { user: userResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);

      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(HttpStatus.OK).json({
        status: "success",
        data: { user: userResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(HttpStatus.NoContent).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
