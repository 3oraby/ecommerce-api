const cartService = require("./cart.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: cart,
  });
});

exports.addToCart = asyncHandler(async (req, res) => {
  await cartService.addToCart(req.user.id, req.params.productId, req.body.quantity);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Product added to cart",
  });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  await cartService.updateCartItem(req.user.id, req.params.productId, req.body.quantity);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Cart item updated",
  });
});

exports.deleteFromCart = asyncHandler(async (req, res) => {
  await cartService.deleteFromCart(req.user.id, req.params.productId);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Product removed from cart",
  });
});
