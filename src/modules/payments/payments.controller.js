const asyncHandler = require("../../utils/asyncHandler");
const paymentsService = require("./payments.service");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");

exports.webhook = asyncHandler(async (req, res, next) => {
  const hmac = req.query.hmac;
  const data = req.body;

  await paymentsService.handleWebhook(data, hmac);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Webhook processed successfully",
  });
});

exports.getPaymentMethods = asyncHandler(async (req, res, next) => {
  const methods = await paymentsService.getPaymentMethods();

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: methods,
  });
});
