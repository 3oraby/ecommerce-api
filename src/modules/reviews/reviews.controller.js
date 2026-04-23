const reviewsService = require("./reviews.service");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const ApiFeatures = require("../../utils/apiFeatures");

exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(null, req.query).filter().sort().paginate();
  const data = await reviewsService.getProductReviews(
    req.params.productId,
    features,
  );

  sendResponse({
    res,
    results: data.reviews.length,
    data: data,
  });
});

exports.createReview = asyncHandler(async (req, res, next) => {
  const review = await reviewsService.createReview(
    req.user.id,
    req.params.productId,
    req.body.rating,
    req.body.review,
  );

  sendResponse({
    res,
    statusCode: HttpStatus.CREATED,
    message: "Review created successfully",
    data: review,
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  await reviewsService.updateReview(
    req.user.id,
    req.params.productId,
    req.body,
  );

  sendResponse({
    res,
    message: "Review updated successfully",
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  await reviewsService.deleteReview(req.user.id, req.user.role, req.params.productId);

  sendResponse({
    res,
    message: "Review deleted successfully",
  });
});
