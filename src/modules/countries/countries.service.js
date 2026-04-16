const countryRepository = require("./countries.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

const normalizeName = (name) => {
  if (!name) return name;
  return name.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

exports.createCountryService = async (req) => {
  const { name, code } = req.body;
  const normalizedName = normalizeName(name);

  const existingName = await countryRepository.findCountryByName(normalizedName);
  if (existingName) {
    throw new ApiError("Country with this name already exists", HttpStatus.Conflict);
  }

  if (code) {
    const existingCode = await countryRepository.findCountryByCode(code.toUpperCase());
    if (existingCode) {
      throw new ApiError("Country with this code already exists", HttpStatus.Conflict);
    }
  }

  return await countryRepository.createCountry({
    name: normalizedName,
    code: code ? code.toUpperCase() : null,
  });
};

exports.getAllCountriesService = async () => {
  return await countryRepository.getAllCountries();
};

exports.getCountryByIdService = async (req) => {
  const country = await countryRepository.findCountryById(req.params.id);
  if (!country) {
    throw new ApiError("Country not found", HttpStatus.NotFound);
  }
  return country;
};

exports.updateCountryService = async (req) => {
  const { id } = req.params;
  const { name, code } = req.body;

  const country = await countryRepository.findCountryById(id);
  if (!country) {
    throw new ApiError("Country not found", HttpStatus.NotFound);
  }

  let normalizedName = country.name;
  let upperCode = country.code;

  if (name) {
    normalizedName = normalizeName(name);
    // Check if another country has this name
    const existingName = await countryRepository.findCountryByName(normalizedName);
    if (existingName && existingName.id !== Number(id)) {
      throw new ApiError("Country with this name already exists", HttpStatus.Conflict);
    }
  }

  if (code) {
    upperCode = code.toUpperCase();
    const existingCode = await countryRepository.findCountryByCode(upperCode);
    if (existingCode && existingCode.id !== Number(id)) {
      throw new ApiError("Country with this code already exists", HttpStatus.Conflict);
    }
  }

  const updatedCountry = await countryRepository.updateCountry(id, {
    name: normalizedName,
    code: upperCode,
  });

  return updatedCountry;
};

exports.deleteCountryService = async (req) => {
  const result = await countryRepository.deleteCountry(req.params.id);
  if (!result) {
    throw new ApiError("Country not found", HttpStatus.NotFound);
  }
  return result;
};
