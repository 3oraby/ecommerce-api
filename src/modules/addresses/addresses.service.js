const addressesRepository = require("./addresses.repository");
const countriesRepository = require("../countries/countries.repository");
const statesRepository = require("../states/states.repository");
const citiesRepository = require("../cities/cities.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

const checkAddressRelations = async (data) => {
  const country = await countriesRepository.findCountryById(data.country_id);
  if (!country) throw new ApiError("Country not found", HttpStatus.BadRequest);

  const state = await statesRepository.getStateById(data.state_id);
  if (!state || Number(state.country_id) !== Number(data.country_id)) {
    throw new ApiError(
      "State not found or does not belong to specified country",
      HttpStatus.BadRequest,
    );
  }

  const city = await citiesRepository.getCityById(data.city_id);
  if (!city || Number(city.state_id) !== Number(data.state_id)) {
    throw new ApiError(
      "City not found or does not belong to specified state",
      HttpStatus.BadRequest,
    );
  }
};

const getAndValidateAddressOwnership = async (addressId, userId) => {
  const address = await addressesRepository.getAddressById(addressId);
  if (!address) throw new ApiError("Address not found", HttpStatus.NotFound);
  if (Number(address.user_id) !== Number(userId)) {
    throw new ApiError(
      "Unauthorized to access this address",
      HttpStatus.Forbidden,
    );
  }
  return address;
};

exports.createAddressService = async (userId, data) => {
  await checkAddressRelations(data);

  // Prevent exact duplicate address
  const existingAddress = await addressesRepository.findExactAddress(
    userId,
    data,
  );
  if (existingAddress) {
    throw new ApiError(
      "Duplicate address for this user",
      HttpStatus.BadRequest,
    );
  }

  // Handle first address as default automatically, or process explicit is_default
  const addressCount = await addressesRepository.countUserAddresses(userId);
  let isDefault = data.is_default || false;

  if (addressCount === 0) {
    isDefault = true; // First address is always default
  }

  const shouldReset = isDefault && addressCount > 0;

  return await addressesRepository.createAddress(
    {
      ...data,
      user_id: userId,
      is_default: isDefault,
    },
    shouldReset,
  );
};

exports.getUserAddressesService = async (userId) => {
  return await addressesRepository.getUserAddresses(userId);
};

exports.getAddressByIdService = async (id, userId) => {
  return await getAndValidateAddressOwnership(id, userId);
};

exports.updateAddressService = async (id, userId, data) => {
  const address = await getAndValidateAddressOwnership(id, userId);

  const finalCountryId = data.country_id || address.country_id;
  const finalStateId = data.state_id || address.state_id;
  const finalCityId = data.city_id || address.city_id;

  await checkAddressRelations({
    country_id: finalCountryId,
    state_id: finalStateId,
    city_id: finalCityId,
  });

  return await addressesRepository.updateAddress(id, data);
};

exports.deleteAddressService = async (id, userId) => {
  const address = await getAndValidateAddressOwnership(id, userId);

  if (!address.is_default) {
    return await addressesRepository.deleteAddress(id);
  }

  const allAddresses = await addressesRepository.getUserAddresses(userId);

  if (allAddresses.length <= 1) {
    return await addressesRepository.deleteAddress(id);
  }

  const currentIndex = allAddresses.findIndex((a) => a.id === Number(id));
  let nextAddress;

  if (currentIndex !== -1 && currentIndex < allAddresses.length - 1) {
    nextAddress = allAddresses[currentIndex + 1];
  } else {
    nextAddress =
      allAddresses[0].id === Number(id) ? allAddresses[1] : allAddresses[0];
  }

  return await addressesRepository.deleteAddress(id, nextAddress.id);
};

exports.setDefaultAddressService = async (id, userId) => {
  const address = await getAndValidateAddressOwnership(id, userId);

  if (address.is_default) {
    throw new ApiError("Address is already the default", HttpStatus.BadRequest);
  }

  return await addressesRepository.setDefaultAddress(id, userId);
};
