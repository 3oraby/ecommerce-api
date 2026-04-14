const authRepository = require("./auth.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
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
    throw new ApiError(errMsg, HttpStatus.Conflict);
  }
};

const sendVerificationEmail = async (user) => {
  const lastOtpSentAt = user.email_otp_sent_at;

  const lastSent = new Date(lastOtpSentAt).getTime();

  if (lastSent && Date.now() - lastSent < 60 * 1000) {
    throw new ApiError(
      "Your account is not verified. We already sent a verification code less than a minute ago. Please check your email or spam folder.",
      HttpStatus.TooManyRequests,
    );
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  await authRepository.saveEmailOTP(user.id, hashedOTP);

  // TODO: send email
  console.log(`Email verification OTP for ${user.email}: ${otp}`);
};

const sendPasswordResetEmail = async (user) => {
  const lastOtpSentAt = user.reset_password_otp_sent_at;

  const lastSent = new Date(lastOtpSentAt).getTime();

  if (lastSent && Date.now() - lastSent < 60 * 1000) {
    throw new ApiError(
      "We already sent a password reset code less than a minute ago. Please check your email or spam folder.",
      HttpStatus.TooManyRequests,
    );
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  await authRepository.saveResetPasswordOTP(user.id, hashedOTP);

  // TODO: send email
  console.log(`Password reset OTP for ${user.email}: ${otp}`);
};

const generateTokensAndSaveSession = async (user, meta) => {
  const accessToken = generateAccessToken(user.id);

  const { refreshToken, jti } = generateRefreshToken(user);

  const hashedToken = hashToken(refreshToken);
  await authRepository.saveRefreshToken(user, hashedToken, jti, meta);

  return { accessToken, refreshToken };
};

exports.signupService = async (req) => {
  const body = req.body;

  await ensureUserNotExists(body.email);

  const user = await authRepository.createUser(body);

  await sendVerificationEmail(user);

  return user;
};

exports.loginService = async (req, meta) => {
  const { email, password } = req.body;

  const user = await checkUserExists(email);

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid credentials", HttpStatus.Unauthorized);
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

  if (!user.email_otp || !user.email_otp_expires_at) {
    throw new ApiError("No OTP found", HttpStatus.BadRequest);
  }

  if (user.email_otp_expires_at < new Date()) {
    throw new ApiError(
      "Your verification code has expired, please request a new one",
      HttpStatus.UnprocessableEntity,
    );
  }

  const isOTPValid = verifyOTP(otp, user.email_otp);
  if (!isOTPValid) {
    throw new ApiError("Invalid OTP", HttpStatus.UnprocessableEntity);
  }

  const verifiedUser = await authRepository.verifyUser(user.id);

  const { accessToken, refreshToken } = await generateTokensAndSaveSession(
    verifiedUser,
    meta,
  );

  return { user: verifiedUser, accessToken, refreshToken };
};

exports.resendEmailVerificationService = async (req) => {
  const { email } = req.body;

  const user = await checkUserExists(email);

  if (user.account_status === AccountStatus.ACTIVE) {
    throw new ApiError("Account already verified", HttpStatus.BadRequest);
  }

  await sendVerificationEmail(user);

  return user;
};

exports.forgotPasswordService = async (req) => {
  const { email } = req.body;

  const user = await checkUserExists(email);

  if (user.account_status === AccountStatus.UNVERIFIED) {
    await sendVerificationEmail(user);

    throw new ApiError(
      "Your account is not verified, check your email for the new OTP",
      HttpStatus.UnprocessableEntity,
    );
  }

  await sendPasswordResetEmail(user);
};

exports.verifyResetOtpService = async (req) => {
  const { email, otp } = req.body;
  const user = await checkUserExists(email);

  if (user.account_status === AccountStatus.UNVERIFIED) {
    await sendVerificationEmail(user);

    throw new ApiError(
      "Your account is not verified, check your email for the new OTP",
      HttpStatus.UnprocessableEntity,
    );
  }

  if (!user.reset_password_otp || !user.reset_password_otp_expires_at) {
    throw new ApiError("No OTP found", HttpStatus.BadRequest);
  }

  if (user.reset_password_otp_expires_at < new Date()) {
    throw new ApiError(
      "Your verification code has expired, please request a new one",
      HttpStatus.UnprocessableEntity,
    );
  }

  const isOTPValid = verifyOTP(otp, user.reset_password_otp);
  if (!isOTPValid) {
    throw new ApiError("Invalid OTP", HttpStatus.UnprocessableEntity);
  }

  await authRepository.clearResetOTP(user.id);

  const resetToken = generatePasswordResetToken(user);

  return { resetToken };
};

exports.resetPasswordService = async (req) => {
  const { resetToken, newPassword } = req.body;

  const decoded = verifyPasswordResetToken(resetToken);

  if (!decoded || !decoded.email || decoded.type !== "reset") {
    throw new ApiError("Invalid reset token", HttpStatus.Unauthorized);
  }

  const user = await checkUserExists(decoded.email);

  if (user.account_status === AccountStatus.UNVERIFIED) {
    await sendVerificationEmail(user);

    throw new ApiError(
      "Your account is not verified, check your email for the new OTP",
      HttpStatus.UnprocessableEntity,
    );
  }

  const updatedUser = await authRepository.updateUserPassword(
    user.id,
    newPassword,
  );

  await authRepository.revokeAllUserSessions(user.id);

  await authRepository.clearResetOTP(user.id);

  return updatedUser;
};

exports.resendPasswordResetOtpService = async (req) => {
  const { email } = req.body;

  const user = await checkUserExists(email);

  if (user.account_status === AccountStatus.UNVERIFIED) {
    await sendVerificationEmail(user);

    throw new ApiError(
      "Your account is not verified, check your email for the new OTP",
      HttpStatus.UnprocessableEntity,
    );
  }

  await sendPasswordResetEmail(user);
};
