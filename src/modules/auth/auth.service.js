const authRepository = require("./auth.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const { generateAccessToken, generateRefreshToken } = require("./token.util");
const { comparePassword } = require("../../utils/password.util");
const AccountStatus = require("../../enums/accountStatus.enum");

const { generateOTP, hashOTP, verifyOTP } = require("../../utils/otp.util");

const sendVerificationEmail = async (user) => {
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  // save OTP in DB
  await authRepository.saveOTP(user.id, hashedOTP);

  // TODO: send email
  console.log(`OTP for ${user.email}: ${otp}`);
};

exports.signupService = async (req, res) => {
  const { name, email, password, role } = req.body;

  // check if user already exists
  const existingUser = await authRepository.getUserByEmail(email);
  if (existingUser) {
    throw new ApiError("User already exists", HttpStatus.UnprocessableEntity);
  }

  const user = await authRepository.createUser({ name, email, password, role });

  await sendVerificationEmail(user);

  return { user };
};

exports.loginService = async (req, res) => {
  const { email, password } = req.body;

  // check if user exists
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw new ApiError("Invalid credentials", HttpStatus.UnprocessableEntity);
  }

  // check if password is correct
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid credentials", HttpStatus.UnprocessableEntity);
  }

  // check if user is not verified
  if (user.account_status === AccountStatus.UNVERIFIED) {
    sendVerificationEmail(user);

    throw new ApiError(
      "Your account is not verified, check your email for the new OTP",
      HttpStatus.UnprocessableEntity,
    );
  }

  // generate tokens
  const accessToken = generateAccessToken(user.id);

  return { user, accessToken };
};

exports.verifyEmailService = async (req, res) => {
  const { email, otp } = req.body;

  // check if user exists
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw new ApiError("Invalid credentials", HttpStatus.UnprocessableEntity);
  }

  if (user.account_status === AccountStatus.ACTIVE) {
    throw new ApiError("Account already verified", HttpStatus.BadRequest);
  }

  // verify OTP
  const isOTPValid = verifyOTP(otp, user.otp);
  if (!isOTPValid) {
    throw new ApiError(
      "Invalid or expired OTP",
      HttpStatus.UnprocessableEntity,
    );
  }

  // activate account
  await authRepository.verifyUser(user.id);

  // generate tokens
  const accessToken = generateAccessToken(user.id);

  return { user, accessToken };
};
