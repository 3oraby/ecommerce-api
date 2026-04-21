const productsService = require("./products.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.getProducts = asyncHandler(async (req, res) => {
  console.log("---------------------------in getProoducts");
  
  const products = await productsService.getProducts(req.user, req.query);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    results: products.length,
    data: products,
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productsService.getProductById(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: product,
  });
});

exports.getProductsByCategory = asyncHandler(async (req, res) => {
  console.log("--------------------------in getProoductsByCategory");
  const { categoryId } = req.params;
  const products = await productsService.getProductsByCategory(
    categoryId,
    req.user,
    req.query,
  );

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    results: products.rows ? products.rows.length : products.length,
    data: products,
  });
});

exports.searchProducts = asyncHandler(async (req, res) => {
  const products = await productsService.searchProducts(req.query, req.user);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: products,
  });
});

//
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productsService.createProduct(
    req.sellerProfile.id,
    req.body,
  );

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "Product created successfully",
    data: product,
  });
});

//
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productsService.updateProduct(req.params.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Product updated successfully",
    data: product,
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await productsService.deleteProduct(req.params.id, req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Product deleted successfully",
  });
});
