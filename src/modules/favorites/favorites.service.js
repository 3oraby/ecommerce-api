const favoritesRepository = require("./favorites.repository");
const productsRepository = require("../products/products.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

const ApiFeatures = require("../../utils/apiFeatures");
const { normalizeRequestQuery } = require("../../utils/query.util");
const cacheKeyBuilder = require("../../services/cache/cacheKeys.util");
const { cacheableList } = require("../../services/cache/cache.helper");
const {
  invalidateFavoritesCache,
} = require("../../services/cache/cacheInvalidation.helper");

exports.getMyFavorites = async (userId, query) => {
  const features = new ApiFeatures({}, query).filter().sort().paginate();

  const limit = features.parsedPagination?.limit || 10;
  const offset = features.parsedPagination?.offset || 0;
  const order = [["added_at", "DESC"]];

  const normalized = features.normalize();
  const normQuery = normalizeRequestQuery(query);

  const cacheKey = cacheKeyBuilder.favorites(userId, normQuery);

  return cacheableList({
    cacheKey,
    repositoryCall: async () => {
      const result = await favoritesRepository.findUserFavorites(
        userId,
        limit,
        offset,
        order,
      );
      result.rows = result.rows.map((favorite) => ({
        added_at: favorite.added_at,
        product: favorite.Product,
      }));
      return result;
    },
    queryBuilderResult: normalized,
  });
};

exports.addToFavorites = async (userId, productId) => {
  const product = await productsRepository.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", HttpStatus.NotFound);
  }

  const existingFavorite = await favoritesRepository.findOneFavorite(
    userId,
    productId,
  );
  if (existingFavorite) {
    throw new ApiError(
      "Product is already in your favorites",
      HttpStatus.Conflict,
    );
  }

  await favoritesRepository.createFavorite(userId, productId);
  await invalidateFavoritesCache(userId);

  return { success: true };
};

exports.removeFromFavorites = async (userId, productId) => {
  const product = await productsRepository.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", HttpStatus.NotFound);
  }

  const deleted = await favoritesRepository.deleteFavorite(userId, productId);
  if (!deleted) {
    throw new ApiError(
      "Product not found in your favorites",
      HttpStatus.NotFound,
    );
  }

  await invalidateFavoritesCache(userId);

  return { success: true };
};
