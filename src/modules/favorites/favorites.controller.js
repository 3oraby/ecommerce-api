const favoritesService = require("./favorites.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await favoritesService.getMyFavorites(req.user.id, req.query);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    results: favorites.data.length,
    data: favorites,
  });
});

exports.addToFavorites = asyncHandler(async (req, res) => {
  await favoritesService.addToFavorites(req.user.id, req.params.productId);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "Product added to favorites successfully",
  });
});

exports.removeFromFavorites = asyncHandler(async (req, res) => {
  await favoritesService.removeFromFavorites(req.user.id, req.params.productId);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Product removed from favorites",
  });
});
