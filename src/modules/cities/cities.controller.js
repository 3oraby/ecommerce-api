const citiesService = require("./cities.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.createCity = asyncHandler(async (req, res) => {
  const city = await citiesService.createCityService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "City created successfully",
    data: city,
  });
});

exports.getCities = asyncHandler(async (req, res) => {
  // Admin only - all cities across all states
  const cities = await citiesService.getCitiesService();

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: cities,
  });
});

exports.getCitiesByState = asyncHandler(async (req, res) => {
  const cities = await citiesService.getCitiesByStateService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: cities,
  });
});

exports.getCityById = asyncHandler(async (req, res) => {
  const city = await citiesService.getCityByIdService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: city,
  });
});

exports.updateCity = asyncHandler(async (req, res) => {
  const city = await citiesService.updateCityService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "City updated successfully",
    data: city,
  });
});

exports.deleteCity = asyncHandler(async (req, res) => {
  await citiesService.deleteCityService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "City deleted successfully",
  });
});
