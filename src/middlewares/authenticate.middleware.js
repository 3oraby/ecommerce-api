const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const HttpStatus = require("../enums/httpStatus.enum");
const User = require("../modules/user/user.model");
const { verifyAccessToken } = require("../modules/auth/token.service");

const extractTokenFromRequest = (req) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  return token;
};

exports.authenticate = asyncHandler(async (req, res, next) => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in! Please log in to get access.",
        HttpStatus.Unauthorized,
      ),
    );
  }

  const decoded = verifyAccessToken(token);

  if (!decoded.id) {
    return next(
      new ApiError(
        "Invalid or expired access token. Please log in again.",
        HttpStatus.Unauthorized,
      ),
    );
  }
  const user = await User.findByPk(decoded.id);

  if (!user) {
    return next(
      new ApiError(
        "The user belonging to this token does no longer exist.",
        HttpStatus.Unauthorized,
      ),
    );
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError(
        "User recently changed password! Please log in again.",
        HttpStatus.Unauthorized,
      ),
    );
  }

  req.user = user;
  next();
});
