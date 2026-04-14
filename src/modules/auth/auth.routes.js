const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const {
  signupValidation,
  loginValidation,
  verifyEmailValidation,
} = require("./auth.validation");

const router = express.Router();

router.post("/signup", validate(signupValidation), authController.signup);
router.post("/login", validate(loginValidation), authController.login);
router.post(
  "/verify-email",
  validate(verifyEmailValidation),
  authController.verifyEmail,
);

module.exports = router;
