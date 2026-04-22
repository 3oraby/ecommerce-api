const productsRepository = require("./products.repository");
const categoriesRepository = require("../categories/categories.repository");
const ApiFeatures = require("../../utils/apiFeatures");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const { sanitizeAndValidateIds } = require("../../utils/array.util");
const { Op } = require("sequelize");
const Roles = require("../../enums/roles.enum");

const buildProductQuery = (query, user) => {
  const filterParams = { ...query };

  const searchKeyword = query.q || query.keyword;
  const categoryId = query.category;

  const excluded = [
    "q",
    "keyword",
    "category",
    "minPrice",
    "maxPrice",
    "inStock",
  ];
  excluded.forEach((el) => delete filterParams[el]);

  if (user && user.role === Roles.SELLER && user.sellerProfile) {
    filterParams.seller_id = user.sellerProfile.id;
  }

  const features = new ApiFeatures({}, filterParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const where = { ...(features.parsedFilters || {}) };

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


exports.getProductById = async (id) => {
  const product = await productsRepository.findById(id);

  if (!product) {
    throw new ApiError("Product not found", HttpStatus.NOT_FOUND);
  }

  return product;
};

exports.getProductsByCategory = async (categoryId, user, query) => {
  const category = await categoriesRepository.findByPk(categoryId);
  if (!category) {
    throw new ApiError("Category not found", HttpStatus.NotFound);
  }

  const builtQuery = buildProductQuery(query, user);
  builtQuery.categoryId = categoryId;

  const products =
    await productsRepository.findWithCategoriesOrSearch(builtQuery);

  if (!products.data || products.total === 0) {
    return {
      total: 0,
      page: 1,
      limit: builtQuery.parsedPagination.limit,
      data: [],
    };
  }

  return products;
};

exports.getSellerProducts = async (user, query) => {
  const builtQuery = buildProductQuery(query, user);

  const products =
    await productsRepository.findWithCategoriesOrSearch(builtQuery);

  if (!products.data || products.total === 0) {
    return {
      total: 0,
      page: 1,
      limit: builtQuery.parsedPagination.limit,
      data: [],
    };
  }

  return products;
};

exports.searchProducts = async (query, user) => {
  const builtQuery = buildProductQuery(query, user);

  return await productsRepository.findWithCategoriesOrSearch(builtQuery);
};

exports.createProduct = async (sellerProfileId, data) => {
  const categories = await sanitizeAndValidateIds({
    ids: data.categories,
    findByIds: categoriesRepository.findByIds,
    errorMessage: "One or more categories not found",
  });

  const { images = [], categories: _, ...productData } = data;
  productData.seller_id = sellerProfileId;

  if (!images.length) {
    throw new ApiError(
      "At least one image is required",
      HttpStatus.BAD_REQUEST,
    );
  }

  productData.main_image = images[0];

  const productImages = images.map((url, index) => ({
    image_url: url,
    is_main: index === 0,
  }));

  return await productsRepository.createProductWithCategoriesAndImages(
    productData,
    categories,
    productImages,
  );
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

  return await productsRepository.updateProductWithCategories(
    id,
    productData,
    categories,
  );
};

exports.deleteProduct = async (id) => {
  const deleted = await productsRepository.deleteProduct(id);

  if (!deleted) {
    throw new ApiError("Product not found", HttpStatus.NotFound);
  }

  return deleted;
};
