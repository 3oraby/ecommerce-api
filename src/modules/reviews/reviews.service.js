const reviewsRepository = require("./reviews.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const Roles = require("../../enums/roles.enum");

exports.getProductReviews = async (productId, features) => {
  const product = await reviewsRepository.findProductById(productId);
  if (!product) {
    throw new ApiError("Product not found", HttpStatus.NotFound);
  }

  return await reviewsRepository.findProductReviews(productId, features);
};

exports.createReview = async (userId, productId, rating, review) => {
  const product = await reviewsRepository.findProductById(productId);
  if (!product) {
    throw new ApiError("Product not found", HttpStatus.NotFound);
  }

  const existingReview = await reviewsRepository.findReviewByUserAndProduct(
    userId,
    productId,
  );

  if (existingReview) {
    throw new ApiError(
      "You have already reviewed this product",
      HttpStatus.BadRequest,
    );
  }

  const hasDeliveredOrder = await reviewsRepository.checkUserDeliveredOrder(
    userId,
    productId,
  );

  if (!hasDeliveredOrder) {
    throw new ApiError(
      "You must purchase and receive this product before reviewing",
      HttpStatus.Forbidden,
    );
  }

  return await reviewsRepository.createReview({
    user_id: userId,
    product_id: productId,
    rating,
    review,
  });
};

exports.updateReview = async (userId, productId, data) => {
  const existingReview = await reviewsRepository.findReviewByUserAndProduct(
    userId,
    productId,
  );

  if (!existingReview) {
    throw new ApiError("Review not found", HttpStatus.NotFound);
  }

  await reviewsRepository.updateReview(userId, productId, data);

  return { success: true };
};

exports.deleteReview = async (userId, role, productId) => {
  const existingReview = await reviewsRepository.findReviewByUserAndProduct(
    userId,
    productId,
  );

  if (!existingReview) {
    throw new ApiError("Review not found", HttpStatus.NotFound);
  }

  if (role !== Roles.ADMIN && existingReview.user_id !== userId) {
    throw new ApiError(
      "You can only delete your own review",
      HttpStatus.Forbidden,
    );
  }

  await reviewsRepository.deleteReview(userId, productId);

  return { success: true };
};
