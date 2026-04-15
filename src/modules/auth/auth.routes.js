const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const {
  signupValidation,
  loginValidation,
  verifyEmailValidation,
  resendEmailVerificationValidation,
  forgotPasswordValidation,
  verifyResetOtpValidation,
  resetPasswordValidation,
  resendPasswordResetOtpValidation,
  updatePasswordValidation,
} = require("./auth.validation");

const router = express.Router();

router.post("/signup", validate(signupValidation), authController.signup);
router.post("/login", validate(loginValidation), authController.login);
router.post(
  "/verify-email",
  validate(verifyEmailValidation),
  authController.verifyEmail,
);
router.post(
  "/resend-email-verification",
  validate(resendEmailVerificationValidation),
  authController.resendEmailVerification,
);

router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  authController.forgotPassword,
);

router.post(
  "/verify-reset-otp",
  validate(verifyResetOtpValidation),
  authController.verifyResetOtp,
);

router.patch(
  "/reset-password",
  validate(resetPasswordValidation),
  authController.resetPassword,
);

router.post(
  "/resend-password-reset-otp",
  validate(resendPasswordResetOtpValidation),
  authController.resendPasswordResetOtp,
);

router.post("/logout", authController.logout);

router.post("/refresh-token", authController.refreshToken);

router.patch(
  "/update-password",
  authenticate,
  validate(updatePasswordValidation),
  authController.updatePassword
);

router.post("/logout-all-devices", authController.logoutAllDevices);

module.exports = router;
