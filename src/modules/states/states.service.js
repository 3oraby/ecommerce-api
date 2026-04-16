const statesRepository = require("./states.repository");
const countriesRepository = require("../countries/countries.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

const normalizeName = (name) => {
  if (!name) return name;
  return name.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

exports.createStateService = async (req) => {
  const { name } = req.body;
  const { countryId } = req.params;
  const normalizedName = normalizeName(name);

  // Validate country_id format and existence
  if (!countryId || isNaN(Number(countryId))) {
      throw new ApiError("Invalid country_id", HttpStatus.UnprocessableEntity);
  }

  const country = await countriesRepository.findCountryById(countryId);
  if (!country) {
    throw new ApiError("Country not found", HttpStatus.NotFound);
  }

  const existingState = await statesRepository.findStateByCountryAndName(countryId, normalizedName);
  if (existingState) {
    throw new ApiError("Duplicate state in same country", HttpStatus.Conflict);
  }

  return await statesRepository.createState({
    country_id: Number(countryId),
    name: normalizedName,
  });
};

exports.getStatesService = async () => {
  return await statesRepository.getStates();
};

exports.getStatesByCountryService = async (req) => {
  const { countryId } = req.params;
  
  if (!countryId || isNaN(Number(countryId))) {
      throw new ApiError("Invalid country_id", HttpStatus.UnprocessableEntity);
  }

  const country = await countriesRepository.findCountryById(countryId);
  if (!country) {
    throw new ApiError("Country not found", HttpStatus.NotFound);
  }

  return await statesRepository.getStatesByCountry(countryId);
};

exports.getStateByIdService = async (req) => {
  const { id, countryId } = req.params;
  const state = await statesRepository.getStateById(id);
  if (!state) {
    throw new ApiError("State not found", HttpStatus.NotFound);
  }
  if (Number(state.country_id) !== Number(countryId)) {
    throw new ApiError("State does not belong to this country", HttpStatus.UnprocessableEntity);
  }
  return state;
};

exports.updateStateService = async (req) => {
  const { id, countryId } = req.params;
  const { name } = req.body;

  const state = await statesRepository.getStateById(id);
  if (!state) {
    throw new ApiError("State not found", HttpStatus.NotFound);
  }

  let finalCountryId = state.country_id;
  let finalName = state.name;

  // We enforce the state being updated belongs to the country in the route
  if (Number(finalCountryId) !== Number(countryId)) {
    throw new ApiError("State does not belong to this country", HttpStatus.UnprocessableEntity);
  }

  if (name) {
    finalName = normalizeName(name);
  }

  const existingState = await statesRepository.findStateByCountryAndName(finalCountryId, finalName);
  if (existingState && existingState.id !== Number(id)) {
    throw new ApiError("Duplicate state in same country", HttpStatus.Conflict);
  }

  return await statesRepository.updateState(id, {
    name: finalName,
    country_id: finalCountryId,
  });
};

exports.deleteStateService = async (req) => {
  const { id, countryId } = req.params;

  const state = await statesRepository.getStateById(id);
  if (!state) {
    throw new ApiError("State not found", HttpStatus.NotFound);
  }
  if (Number(state.country_id) !== Number(countryId)) {
    throw new ApiError("State does not belong to this country", HttpStatus.UnprocessableEntity);
  }

  const result = await statesRepository.deleteState(id);
  if (!result) {
    throw new ApiError("State not found", HttpStatus.NotFound);
  }
  return result;
};
