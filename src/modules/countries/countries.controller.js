const countriesService = require("./countries.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.createCountry = asyncHandler(async (req, res) => {
  const country = await countriesService.createCountryService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "Country created successfully",
    data: country,
  });
});

exports.getAllCountries = asyncHandler(async (req, res) => {
  const countries = await countriesService.getAllCountriesService();

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: countries,
  });
});

exports.getCountryById = asyncHandler(async (req, res) => {
  const country = await countriesService.getCountryByIdService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: country,
  });
});

exports.updateCountry = asyncHandler(async (req, res) => {
  const country = await countriesService.updateCountryService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Country updated successfully",
    data: country,
  });
});

exports.deleteCountry = asyncHandler(async (req, res) => {
  await countriesService.deleteCountryService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Country deleted successfully",
  });
});
