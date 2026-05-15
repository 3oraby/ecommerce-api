const express = require("express");
const paymentsController = require("./payments.controller");

const router = express.Router();

router.get("/methods", paymentsController.getPaymentMethods);
router.post("/paymob/callback", paymentsController.webhook);
router.get("/paymob/callback", paymentsController.handleRedirect);

module.exports = router;
