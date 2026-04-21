const productsRepository = require("../modules/products/products.repository");
const ApiError = require("../utils/apiError");
const HttpStatus = require("../enums/httpStatus.enum");
const Roles = require("../enums/roles.enum");

exports.checkProductOwnership = async (req, res, next) => {
  try {
    const product = await productsRepository.findById(req.params.id);
    if (!product) {
      return next(new ApiError("Product not found", HttpStatus.NotFound));
    }

    if (
      req.user.role !== Roles.ADMIN &&
      product.seller_id !== req.sellerProfile.id
    ) {
      return next(
        new ApiError("Unauthorized to access this product", HttpStatus.Forbidden)
      );
    }

    req.product = product;
    next();
  } catch (error) {
    next(error);
  }
};
