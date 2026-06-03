const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const ordersService = require("./orders.service");
const ApiFeatures = require("../../utils/apiFeatures");

exports.checkout = asyncHandler(async (req, res, next) => {
  const { address_id, payment_method, wallet_phone } = req.body;

  const result = await ordersService.checkout(
    req.user.id,
    address_id,
    payment_method,
    wallet_phone
  );

  sendResponse({
    res,
    statusCode: HttpStatus.CREATED,
    message: "Order placed successfully",
    data: result,
  });
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  await ordersService.cancelOrder(req.user.id, req.params.id);

  sendResponse({
    res,
    message: "Order canceled successfully",
  });
});

exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(null, req.query).filter().sort().paginate();
  const data = await ordersService.getMyOrders(
    req.user.id,
    features,
    req.query,
  );

  sendResponse({
    res,
    data,
  });
});

exports.getMyCanceledOrders = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(null, req.query).filter().sort().paginate();
  const data = await ordersService.getMyCanceledOrders(
    req.user.id,
    features,
    req.query,
  );

  sendResponse({
    res,
    data,
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  await ordersService.updateOrderStatusAdmin(req.params.id, req.body.status);

  sendResponse({
    res,
    message: "Order status updated successfully",
  });
});

exports.getSellerOrders = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(null, req.query).filter().sort().paginate();

  const data = await ordersService.getSellerOrders(req.user.id, features, req.query);

  sendResponse({
    res,
    data,
  });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await ordersService.getOrderById(
    req.params.id,
    req.user.id,
    req.user.role,
  );

  sendResponse({
    res,
    data: order,
  });
});

exports.getOrderSummary = asyncHandler(async (req, res, next) => {
  const summary = await ordersService.getOrderSummary(
    req.params.id,
    req.user.id,
    req.user.role,
  );

  sendResponse({
    res,
    data: summary,
  });
});
