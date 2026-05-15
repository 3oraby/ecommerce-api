const asyncHandler = require("../../utils/asyncHandler");
const paymentsService = require("./payments.service");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const { renderTemplate } = require("../../utils/templateRenderer.util");

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

exports.handleRedirect = asyncHandler(async (req, res, next) => {
  const { success } = req.query;

  const templateName =
    success === "true" ? "payment-success" : "payment-failed";

  const html = renderTemplate({
    moduleName: "payments",
    templateName,
    data: {
      title: "Payment Result",
    },
  });

  return res.send(html);
});

exports.getPaymentMethods = asyncHandler(async (req, res, next) => {
  const methods = await paymentsService.getPaymentMethods();

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: methods,
  });
});
