const express = require("express");
const userController = require("./user.controller");
const validate = require("../../middlewares/validate.middleware");
const {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} = require("./user.validation");

const router = express.Router();

// add authinticate
// add restrict to
router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);
router.delete("/me", userController.deleteMe);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(validate(createUserSchema), userController.createUser);

router
  .route("/:id")
  .get(validate(userIdParamsSchema), userController.getUserById)
  .patch(validate(updateUserSchema), userController.updateUser)
  .delete(validate(userIdParamsSchema), userController.deleteUser);

module.exports = router;
