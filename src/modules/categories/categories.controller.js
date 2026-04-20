const categoriesService = require("./categories.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.createCategory(req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "Category created successfully",
    data: category,
  });
});

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoriesService.getAllCategories();

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: categories,
  });
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoriesService.getCategoryById(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.updateCategory(req.params.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Category updated successfully",
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await categoriesService.deleteCategory(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Category deleted successfully",
  });
});
