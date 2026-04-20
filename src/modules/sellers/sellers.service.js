const sellersRepository = require("./sellers.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const Roles = require("../../enums/roles.enum");

exports.createSellerProfile = async (userId, userRole, data) => {
  if (userRole !== Roles.SELLER) {
    throw new ApiError(
      "Only users with SELLER role can create a profile",
      HttpStatus.Forbidden,
    );
  }

  const existingProfile = await sellersRepository.findByUserId(userId);
  if (existingProfile) {
    throw new ApiError(
      "User already has a seller profile",
      HttpStatus.BadRequest,
    );
  }

  return await sellersRepository.create({
    ...data,
    user_id: userId,
  });
};

exports.getAllSellers = async () => {
  return await sellersRepository.findAll();
};

exports.getSellerProfileById = async (id) => {
  const profile = await sellersRepository.findByPk(id);
  if (!profile) {
    throw new ApiError("Seller profile not found", HttpStatus.NotFound);
  }
  return profile;
};

exports.getMySellerProfile = async (userId) => {
  const profile = await sellersRepository.findByUserId(userId);
  if (!profile) {
    throw new ApiError("Seller profile not found", HttpStatus.NotFound);
  }
  return profile;
};

exports.updateSellerProfile = async (userId, data) => {
  const profile = await sellersRepository.findByUserId(userId);
  if (!profile) {
    throw new ApiError("Seller profile not found", HttpStatus.NotFound);
  }

  // Prevent modifying the verification status via update
  const safeData = { ...data };
  if (typeof safeData.is_store_verified !== "undefined") {
    delete safeData.is_store_verified;
  }

  return await sellersRepository.update(userId, safeData);
};

exports.deleteSellerProfile = async (userId) => {
  const result = await sellersRepository.destroy(userId);
  if (!result) {
    throw new ApiError("Seller profile not found", HttpStatus.NotFound);
  }
  return result;
};
