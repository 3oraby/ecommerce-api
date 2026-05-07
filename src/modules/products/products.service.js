const productsRepository = require("./products.repository");
const categoriesRepository = require("../categories/categories.repository");
const ApiFeatures = require("../../utils/apiFeatures");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const { sanitizeAndValidateIds } = require("../../utils/array.util");
const { Op } = require("sequelize");
const { setCache } = require("../../services/cache/cache.service");
const { cacheOrFetch } = require("../../services/cache/cache.helper");
const cacheKeyBuilder = require("../../services/cache/cacheKeys.util");
const {
  invalidateProductCaches,
} = require("../../services/cache/cacheInvalidation.helper");

const buildProductQuery = (query, options = {}) => {
  const filterParams = { ...query };

  const searchKeyword = query.q || query.keyword;
  const categoryId = query.category;

  ["q", "keyword", "category", "minPrice", "maxPrice", "inStock"].forEach(
    (el) => delete filterParams[el],
  );

  const features = new ApiFeatures({}, filterParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const where = { ...(features.parsedFilters || {}) };

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
    parsedSort: features.parsedSort,
    parsedAttributes: features.parsedAttributes,
    parsedPagination: features.parsedPagination,
    searchKeyword,
    categoryId,
  };
};

const normalizeQuery = (q) => ({
  page: q.parsedPagination?.page || 1,
  limit: q.parsedPagination?.limit || 10,
  sort: q.parsedSort || null,
  search: q.searchKeyword || null,
  categoryId: q.categoryId || null,
});

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

  const norm = normalizeQuery(built);

  const key = cacheKeyBuilder.products(norm);

  return cacheOrFetch(key, async () => {
    const result = await productsRepository.findWithCategoriesOrSearch(built);

    return {
      total: result.total || 0,
      page: norm.page,
      limit: norm.limit,
      data: result.data || [],
    };
  });
};

exports.getSellerProducts = async (query, sellerProfile) => {
  const builtQuery = buildProductQuery(query, {
    sellerId: sellerProfile?.id,
  });
  const norm = normalizeQuery(builtQuery);

  const key = cacheKeyBuilder.sellerProducts(sellerProfile?.id, norm);

  return cacheOrFetch(key, async () => {
    const result =
      await productsRepository.findWithCategoriesOrSearch(builtQuery);

    return {
      total: result.total || 0,
      page: norm.page,
      limit: norm.limit,
      data: result.data || [],
    };
  });
};

exports.searchProducts = async (query, user) => {
  const built = buildProductQuery(query, user);
  const norm = normalizeQuery(built);

  const key = cacheKeyBuilder.products(norm);

  return cacheOrFetch(
    key,
    () => productsRepository.findWithCategoriesOrSearch(built),
    "5m",
  );
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

  const product = await productsRepository.updateProductWithCategories(
    id,
    productData,
    categories,
  );

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
      featured_products: featured,
      new_arrivals: newArrivals,
      top_rated: topRated,
      best_sellers: bestSellers,
      categories,
    };
  });
};
