const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { signupValidation } = require("./auth.validation");

const router = express.Router();

router.post("/signup", validate(signupValidation), authController.signup);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);

module.exports = router;
