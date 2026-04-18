const citiesRepository = require("./cities.repository");
const statesRepository = require("../states/states.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

const normalizeName = (name) => {
  if (!name) return name;
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

exports.createCityService = async (req) => {
  const { name } = req.body;
  const { stateId } = req.params;
  const normalizedName = normalizeName(name);

  // Validate state_id format and existence
  if (!stateId || isNaN(Number(stateId))) {
    throw new ApiError("Invalid state_id", HttpStatus.UnprocessableEntity);
  }

  const state = await statesRepository.getStateById(stateId);
  if (!state) {
    throw new ApiError("State not found", HttpStatus.NotFound);
  }

  const existingCity = await citiesRepository.findCityByStateAndName(
    stateId,
    normalizedName,
  );
  if (existingCity) {
    throw new ApiError("Duplicate city in same state", HttpStatus.Conflict);
  }

  return await citiesRepository.createCity({
    state_id: Number(stateId),
    name: normalizedName,
  });
};

exports.getCitiesService = async () => {
  return await citiesRepository.getCities();
};

exports.getCitiesByStateService = async (req) => {
  const { stateId } = req.params;

  if (!stateId || isNaN(Number(stateId))) {
    throw new ApiError("Invalid state_id", HttpStatus.UnprocessableEntity);
  }

  const state = await statesRepository.getStateById(stateId);
  if (!state) {
    throw new ApiError("State not found", HttpStatus.NotFound);
  }

  return await citiesRepository.getCitiesByState(stateId);
};

exports.getCityByIdService = async (req) => {
  const { id } = req.params;
  const city = await citiesRepository.getCityById(id);
  if (!city) {
    throw new ApiError("City not found", HttpStatus.NotFound);
  }
  return city;
};

exports.updateCityService = async (req) => {
  const { id, stateId } = req.params;
  const { name } = req.body;

  const city = await citiesRepository.getCityById(id);
  if (!city) {
    throw new ApiError("City not found", HttpStatus.NotFound);
  }

  let finalStateId = city.state_id;
  let finalName = city.name;

  // We enforce the city being updated belongs to the state in the route
  if (Number(finalStateId) !== Number(stateId)) {
    throw new ApiError(
      "City does not belong to this state",
      HttpStatus.UnprocessableEntity,
    );
  }

  if (name) {
    finalName = normalizeName(name);
  }

  const existingCity = await citiesRepository.findCityByStateAndName(
    finalStateId,
    finalName,
  );
  if (existingCity && existingCity.id !== Number(id)) {
    throw new ApiError("Duplicate city in same state", HttpStatus.Conflict);
  }

  return await citiesRepository.updateCity(id, {
    name: finalName,
    state_id: finalStateId,
  });
};

exports.deleteCityService = async (req) => {
  const { id, stateId } = req.params;

  const city = await citiesRepository.getCityById(id);
  if (!city) {
    throw new ApiError("City not found", HttpStatus.NotFound);
  }
  if (Number(city.state_id) !== Number(stateId)) {
    throw new ApiError(
      "City does not belong to this state",
      HttpStatus.UnprocessableEntity,
    );
  }

  const result = await citiesRepository.deleteCity(id);
  if (!result) {
    throw new ApiError("City not found", HttpStatus.NotFound);
  }
  return result;
};
