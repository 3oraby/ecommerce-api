const sellersRepository = require("../modules/sellers/sellers.repository");
const ApiError = require("../utils/apiError");
const HttpStatus = require("../enums/httpStatus.enum");

exports.checkSellerProfileExists = async (req, res, next) => {
  try {
    const seller = await sellersRepository.findByUserId(req.user.id);
    if (!seller) {
      return next(
        new ApiError(
          "Seller profile not found. Please create one.",
          HttpStatus.BadRequest
        )
      );
    }
    req.sellerProfile = seller;
    next();
  } catch (error) {
    next(error);
  }
};
