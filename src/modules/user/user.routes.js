const express = require("express");
const userController = require("./user.controller");
const validate = require("../../middlewares/validate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createUserSchema,
  updateUserSchema,
  updateMeSchema,
  userIdParamsSchema,
} = require("./user.validation");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");
const fileFields = require("../../enums/fileFields.enum");

const router = express.Router();

router.use(authenticate);

// --- ANY USER ---
router.get("/me", userController.getMe);
router.patch(
  "/me",
  uploadSingleImage(),
  validate(updateMeSchema),
  userController.updateMe,
);
router.delete("/me", userController.deleteMe);

// --- ADMIN ONLY ---
router.use(restrictTo(Roles.ADMIN));

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
