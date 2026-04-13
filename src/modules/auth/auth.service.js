const authRepository = require("./auth.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("./token.service");
const { comparePassword } = require("../../utils/password.util");
const AccountStatus = require("../../enums/accountStatus.enum");

const { generateOTP, hashOTP, verifyOTP } = require("../../utils/otp.util");

const checkUserExists = async (email, errMsg = "Invalid credentials") => {
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw new ApiError(errMsg, HttpStatus.UnprocessableEntity);
  }
  return user;
};

const ensureUserNotExists = async (email, errMsg = "User already exists") => {
  const user = await authRepository.getUserByEmail(email);
  if (user) {
    throw new ApiError(errMsg, HttpStatus.UnprocessableEntity);
  }
};

const sendVerificationEmail = async (user) => {
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  await authRepository.saveOTP(user.id, hashedOTP);

  // TODO: send email
  console.log(`OTP for ${user.email}: ${otp}`);
};

const generateTokensAndSaveSession = async (user, meta) => {
  const accessToken = generateAccessToken(user.id);

  const { refreshToken, jti } = generateRefreshToken(user);

  const hashedToken = hashToken(refreshToken);
  await authRepository.saveRefreshToken(user, hashedToken, jti, meta);

  return { accessToken, refreshToken };
};

exports.signupService = async (req) => {
  const { name, email, password, role } = req.body;

  await ensureUserNotExists(email);

  const user = await authRepository.createUser({ name, email, password, role });

  await sendVerificationEmail(user);

  return { user };
};

exports.loginService = async (req, meta) => {
  const { email, password } = req.body;

  const user = await checkUserExists(email);

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid credentials", HttpStatus.UnprocessableEntity);
  }

  if (user.account_status === AccountStatus.UNVERIFIED) {
    await sendVerificationEmail(user);

    throw new ApiError(
      "Your account is not verified, check your email for the new OTP",
      HttpStatus.UnprocessableEntity,
    );
  }

  const { accessToken, refreshToken } = await generateTokensAndSaveSession(
    user,
    meta,
  );

  return { user, accessToken, refreshToken };
};

exports.verifyEmailService = async (req, meta) => {
  const { email, otp } = req.body;

  const user = await checkUserExists(email);

  if (user.account_status === AccountStatus.ACTIVE) {
    throw new ApiError("Account already verified", HttpStatus.BadRequest);
  }

  if (!user.otp || !user.otp_expires_at) {
    throw new ApiError("No OTP found", HttpStatus.BadRequest);
  }

  if (user.otp_expires_at < new Date()) {
    throw new ApiError("OTP expired", HttpStatus.UnprocessableEntity);
  }

  const isOTPValid = verifyOTP(otp, user.otp);
  if (!isOTPValid) {
    throw new ApiError("Invalid OTP", HttpStatus.UnprocessableEntity);
  }

  await authRepository.verifyUser(user.id);

  const { accessToken, refreshToken } = await generateTokensAndSaveSession(
    user,
    meta,
  );

  return { user, accessToken, refreshToken };
};
