const statesService = require("./states.service");
const HttpStatus = require("../../enums/httpStatus.enum");
const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

exports.createState = asyncHandler(async (req, res) => {
  const state = await statesService.createStateService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.Created,
    message: "State created successfully",
    data: state,
  });
});

exports.getStates = asyncHandler(async (req, res) => {
  const states = await statesService.getStatesService();

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: states,
  });
});

exports.getStatesByCountry = asyncHandler(async (req, res) => {
  const states = await statesService.getStatesByCountryService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: states,
  });
});

exports.getStateById = asyncHandler(async (req, res) => {
  const state = await statesService.getStateByIdService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    data: state,
  });
});

exports.updateState = asyncHandler(async (req, res) => {
  const state = await statesService.updateStateService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "State updated successfully",
    data: state,
  });
});

exports.deleteState = asyncHandler(async (req, res) => {
  await statesService.deleteStateService(req);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "State deleted successfully",
  });
});
