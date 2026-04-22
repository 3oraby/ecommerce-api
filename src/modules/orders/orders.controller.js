const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const ordersService = require("./orders.service");
const ApiFeatures = require("../../utils/apiFeatures");

exports.checkout = asyncHandler(async (req, res, next) => {
  const { address_id, payment_method } = req.body;

  const order = await ordersService.checkout(
    req.user.id,
    address_id,
    payment_method,
  );

  sendResponse({
    res,
    statusCode: HttpStatus.CREATED,
    message: "Order placed successfully",
    data: order,
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
  const { count, rows } = await ordersService.getMyOrders(
    req.user.id,
    features,
  );

  sendResponse({
    res,
    results: count,
    data: rows,
  });
});

exports.getMyCanceledOrders = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(null, req.query).filter().sort().paginate();
  const { count, rows } = await ordersService.getMyCanceledOrders(
    req.user.id,
    features,
  );

  sendResponse({
    res,
    results: count,
    data: rows,
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

  const data = await ordersService.getSellerOrders(req.user.id, features);

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
