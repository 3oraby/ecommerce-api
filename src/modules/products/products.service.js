const productsRepository = require("./products.repository");
const categoriesRepository = require("../categories/categories.repository");
const QueryBuilder = require("../../utils/queryBuilder");
const { normalizeQuery } = require("../../utils/query.util");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const { sanitizeAndValidateIds } = require("../../utils/array.util");
const { Op } = require("sequelize");
const { setCache } = require("../../services/cache/cache.service");
const { cacheOrFetch, cacheableList } = require("../../services/cache/cache.helper");
const cacheKeyBuilder = require("../../services/cache/cacheKeys.util");
const {
  invalidateProductCaches,
} = require("../../services/cache/cacheInvalidation.helper");
const centralNotificationService = require("../../services/notifications/notification.service");
const NotificationTypes = require("../../enums/notificationTypes.enum");
const favoritesRepository = require("../favorites/favorites.repository");

const buildProductQuery = (query, options = {}) => {
  const qb = new QueryBuilder(query)
    .filter(["category", "minPrice", "maxPrice", "inStock"])
    .sort()
    .limitFields()
    .paginate()
    .search();

  const normalized = qb.normalize();

  const where = { ...(normalized.filters || {}) };

  if (options.sellerId) {
    where.seller_id = options.sellerId;
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price[Op.gte] = Number(query.minPrice);
    if (query.maxPrice) where.price[Op.lte] = Number(query.maxPrice);
  }

  if (query.rating) {
    where.rating = { [Op.gte]: Number(query.rating) };
  }

  if (query.inStock === "true") {
    where.stock = { [Op.gt]: 0 };
  }

  return {
    where,
    parsedSort: normalized.sort,
    parsedAttributes: normalized.attributes,
    parsedPagination: normalized.pagination,
    searchKeyword: normalized.search,
    categoryId: query.category,
    queryBuilderResult: normalized
  };
};

exports.getProductById = async (id) => {
  const key = cacheKeyBuilder.product(id);

  return cacheOrFetch(key, async () => {
    const product = await productsRepository.findById(id);

    if (!product) {
      throw new ApiError("Product not found", HttpStatus.NOT_FOUND);
    }

    return product;
  });
};

exports.getProductsByCategory = async (categoryId, user, query) => {
  const category = await categoriesRepository.findByPk(categoryId);

  if (!category) throw new ApiError("Category not found", HttpStatus.NOT_FOUND);

  const built = buildProductQuery(query, user);
  built.categoryId = categoryId;

  const norm = normalizeQuery(built.queryBuilderResult, { categoryId });
  const key = cacheKeyBuilder.products(norm);

  return cacheableList({
    cacheKey: key,
    repositoryCall: () => productsRepository.findWithCategoriesOrSearch(built),
    queryBuilderResult: built.queryBuilderResult
  });
};

exports.getSellerProducts = async (query, sellerProfile) => {
  const builtQuery = buildProductQuery(query, {
    sellerId: sellerProfile?.id,
  });
  const norm = normalizeQuery(builtQuery.queryBuilderResult);

  const key = cacheKeyBuilder.sellerProducts(sellerProfile?.id, norm);

  return cacheableList({
    cacheKey: key,
    repositoryCall: () => productsRepository.findWithCategoriesOrSearch(builtQuery),
    queryBuilderResult: builtQuery.queryBuilderResult
  });
};

exports.searchProducts = async (query, user) => {
  const built = buildProductQuery(query, user);
  const norm = normalizeQuery(built.queryBuilderResult);

  const key = cacheKeyBuilder.products(norm);

  return cacheableList({
    cacheKey: key,
    repositoryCall: () => productsRepository.findWithCategoriesOrSearch(built),
    queryBuilderResult: built.queryBuilderResult,
    ttl: "5m"
  });
};

exports.createProduct = async (sellerId, data) => {
  const categories = await sanitizeAndValidateIds({
    ids: data.categories,
    findByIds: categoriesRepository.findByIds,
    errorMessage: "One or more categories not found",
  });

  const { images = [], categories: _, ...productData } = data;
  productData.seller_id = sellerId;

  if (!images.length) {
    throw new ApiError(
      "At least one image is required",
      HttpStatus.BAD_REQUEST,
    );
  }

  productData.main_image = images[0];

  const productImages = images.map((url, i) => ({
    image_url: url,
    is_main: i === 0,
  }));

  const product = await productsRepository.createProductWithCategoriesAndImages(
    productData,
    categories,
    productImages,
  );

  const cacheKey = cacheKeyBuilder.product(product.id);

  await setCache(cacheKey, product);
  await invalidateProductCaches();

  return product;
};

exports.updateProduct = async (id, data) => {
  let categories = null;

  if (data.categories) {
    categories = await sanitizeAndValidateIds({
      ids: data.categories,
      findByIds: categoriesRepository.findByIds,
      errorMessage: "One or more categories not found",
    });
  }

  const productData = { ...data };
  delete productData.categories;

  const oldProduct = await productsRepository.findById(id);

  const product = await productsRepository.updateProductWithCategories(
    id,
    productData,
    categories,
  );

  if (oldProduct) {
    let notifyBackInStock = false;
    let notifyPriceDrop = false;

    if (oldProduct.stock === 0 && product.stock > 0) {
      notifyBackInStock = true;
    }

    if (product.price < oldProduct.price) {
      notifyPriceDrop = true;
    }

    if (notifyBackInStock || notifyPriceDrop) {
      const userIds = await favoritesRepository.getUsersWhoFavoritedProduct(id);
      
      if (userIds.length > 0) {
        if (notifyBackInStock) {
          await centralNotificationService.sendBulkNotifications(userIds, {
            title: "Product Back in Stock!",
            body: `${product.name} is back in stock. Grab it before it's gone!`,
            type: NotificationTypes.PRODUCT_BACK_IN_STOCK,
            data: { productId: id },
          });
        }
        
        if (notifyPriceDrop) {
          await centralNotificationService.sendBulkNotifications(userIds, {
            title: "Price Drop Alert!",
            body: `Great news! ${product.name} is now cheaper.`,
            type: NotificationTypes.PRICE_DROP,
            data: { productId: id, newPrice: product.price },
          });
        }
      }
    }
  }

  await invalidateProductCaches({ productId: id });

  return product;
};

exports.deleteProduct = async (id) => {
  const deleted = await productsRepository.deleteProduct(id);

  if (!deleted) throw new ApiError("Product not found", HttpStatus.NOT_FOUND);

  await invalidateProductCaches({ productId: id });

  return deleted;
};

exports.getHomeData = async () => {
  const key = cacheKeyBuilder.homeData();

  return cacheOrFetch(key, async () => {
    const [featured, newArrivals, topRated, bestSellers, categories] =
      await Promise.all([
        productsRepository.getFeaturedProducts(),
        productsRepository.getNewArrivals(),
        productsRepository.getTopRatedProducts(),
        productsRepository.getBestSellers(),
        productsRepository.getHomeCategories(),
      ]);

    return {
      featured_products: featured.rows,
      new_arrivals: newArrivals.rows,
      top_rated: topRated.rows,
      best_sellers: bestSellers.rows,
      categories: categories.rows,
    };
  });
};
