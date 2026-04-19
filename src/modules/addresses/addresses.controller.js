const addressesService = require("./addresses.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.createAddress = asyncHandler(async (req, res) => {
  const address = await addressesService.createAddressService(req.user.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "Address created successfully",
    data: address,
  });
});

exports.getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressesService.getUserAddressesService(req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: addresses,
  });
});

exports.getAddressById = asyncHandler(async (req, res) => {
  const address = await addressesService.getAddressByIdService(req.params.id, req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: address,
  });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const address = await addressesService.updateAddressService(req.params.id, req.user.id, req.body);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Address updated successfully",
    data: address,
  });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await addressesService.deleteAddressService(req.params.id, req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Address deleted successfully",
  });
});

exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressesService.setDefaultAddressService(req.params.id, req.user.id);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Default address updated successfully",
    data: address,
  });
});
