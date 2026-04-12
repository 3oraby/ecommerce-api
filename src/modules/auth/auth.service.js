const authRepository = require("./auth.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const { generateAccessToken } = require("./token.util");

exports.signupService = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // check if user already exists
  const existingUser = await authRepository.getUserByEmail(email);
  if (existingUser) {
    return next(
      new ApiError("User already exists", HttpStatus.UnprocessableEntity),
    );
  }

  const user = await authRepository.createUser({ name, email, password, role });

  const accessToken = generateAccessToken(user.id);

  return { user, accessToken };
};
