const reviewsRepository = require("./reviews.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const Roles = require("../../enums/roles.enum");
const { formatPaginatedResponse } = require("../../utils/pagination.util");
const { normalizeQuery } = require("../../utils/query.util");
const cacheKeyBuilder = require("../../services/cache/cacheKeys.util");
const { cacheOrFetch } = require("../../services/cache/cache.helper");
const { invalidateReviewsCache } = require("../../services/cache/cacheInvalidation.helper");

exports.getProductReviews = async (productId, features) => {
  const product = await reviewsRepository.findProductById(productId);
  if (!product) {
    throw new ApiError("Product not found", HttpStatus.NotFound);
  }

  const normalized = features.normalize();
  const normQuery = normalizeQuery(normalized);
  const cacheKey = cacheKeyBuilder.reviewsProduct(productId, normQuery);

  return cacheOrFetch(cacheKey, async () => {
    const result = await reviewsRepository.findProductReviews(productId, features);

    const page = features?.parsedPagination?.page || 1;
    const limit = features?.parsedPagination?.limit || 10;

    const formatted = formatPaginatedResponse({
      totalItems: result.count,
      page,
      limit,
      data: result.rows,
    });

    formatted.averageRating = result.averageRating;
    return formatted;
  });
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

  const newReview = await reviewsRepository.createReview({
    user_id: userId,
    product_id: productId,
    rating,
    review,
  });

  await invalidateReviewsCache(userId, productId);

  return newReview;
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

  await invalidateReviewsCache(userId, productId);

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

  await invalidateReviewsCache(userId, productId);

  return { success: true };
};
