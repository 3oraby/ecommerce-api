const sellersService = require("./sellers.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.createSellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellersService.createSellerProfile(
    req.user.id,
    req.user.role,
    req.body
  );

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "Seller profile created successfully",
    data: profile,
  });
});

exports.getAllSellers = asyncHandler(async (req, res) => {
  const profiles = await sellersService.getAllSellers();

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: profiles,
  });
});

exports.getSellerProfileById = asyncHandler(async (req, res) => {
  const profile = await sellersService.getSellerProfileById(req.params.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: profile,
  });
});

exports.getMySellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellersService.getMySellerProfile(req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: profile,
  });
});

exports.updateSellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellersService.updateSellerProfile(req.user.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Seller profile updated successfully",
    data: profile,
  });
});

exports.deleteSellerProfile = asyncHandler(async (req, res) => {
  await sellersService.deleteSellerProfile(req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Seller profile deleted successfully",
  });
});
