const productsRepository = require("./products.repository");
const categoriesRepository = require("../categories/categories.repository");
const ApiFeatures = require("../../utils/apiFeatures");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const { sanitizeAndValidateIds } = require("../../utils/array.util");

exports.getProducts = async (user, query) => {
  const filterParams = { ...query };
  // If user is Seller and NOT an Admin, enforce seeing ONLY his specific products
  if (user && user.role === "SELLER" && user.sellerProfile) {
    filterParams.seller_id = user.sellerProfile.id;
  }

  const features = new ApiFeatures({}, filterParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  return await productsRepository.findAll(features);
};

///
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

  const filterParams = { ...query };

  if (user && user.role === "SELLER" && user.sellerProfile) {
    filterParams.seller_id = user.sellerProfile.id;
  }

  const features = new ApiFeatures({}, filterParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await productsRepository.findWithCategoriesOrSearch({
    ...features,
    categoryId,
  });

  if (!products.rows || products.count === 0) {
    return [];
  }

  return products;
};

exports.searchProducts = async (query, user) => {
  const filterParams = { ...query };
  const searchKeyword = filterParams.keyword;

  if (user && user.role === "SELLER" && user.sellerProfile) {
    filterParams.seller_id = user.sellerProfile.id;
  }

  const features = new ApiFeatures({}, filterParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  return await productsRepository.findWithCategoriesOrSearch({
    ...features,
    searchKeyword,
  });
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
  const categories = await sanitizeAndValidateIds({
    ids: data.categories,
    findByIds: categoriesRepository.findByIds,
    errorMessage: "One or more categories not found",
  });

  const productData = { ...data };
  delete productData.categories;

  return await productsRepository.updateProductWithCategories(
    id,
    productData,
    categories,
  );
};

exports.deleteProduct = async (id, userId) => {
  return await productsRepository.deleteProduct(id);
};
