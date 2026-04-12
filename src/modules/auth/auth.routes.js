const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { signupValidation } = require("./auth.validation");

const router = express.Router();

router.post("/signup", validate(signupValidation), authController.signup);

module.exports = router;
