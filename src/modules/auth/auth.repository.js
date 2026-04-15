const User = require("../user/user.model");
const RefreshToken = require("./refreshToken.model");
const AccountStatus = require("../../enums/accountStatus.enum");

exports.getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

exports.getUserById = async (id) => {
  return await User.findByPk(id);
};

exports.createUser = async (userData) => {
  return await User.create(userData);
};

exports.saveEmailOTP = async (userId, hashedOTP) => {
  const otpExpiresIn = parseInt(process.env.OTP_EXPIRES_IN, 10) || 10;

  const expires = new Date(Date.now() + otpExpiresIn * 60 * 1000);

  return await User.update(
    {
      email_otp: hashedOTP,
      email_otp_expires_at: expires,
      email_otp_sent_at: new Date(),
    },
    { where: { id: userId } },
  );
};

exports.saveResetPasswordOTP = async (userId, hashedOTP) => {
  const otpExpiresIn = parseInt(process.env.OTP_EXPIRES_IN, 10) || 10;

  const expires = new Date(Date.now() + otpExpiresIn * 60 * 1000);

  return await User.update(
    {
      reset_password_otp: hashedOTP,
      reset_password_otp_expires_at: expires,
      reset_password_otp_sent_at: new Date(),
    },
    { where: { id: userId } },
  );
};

exports.verifyUser = async (userId) => {
  const user = await User.findByPk(userId);

  return await user.update({
    account_status: AccountStatus.ACTIVE,
    email_otp: null,
    email_otp_expires_at: null,
    email_otp_sent_at: null,
  });
};

exports.saveRefreshToken = async (user, hashedToken, jti, meta) => {
  const expiresInDays = Number(process.env.JWT_REFRESH_EXPIRES_IN) || 90;

  const refreshTokenData = {
    user_id: user.id,
    token: hashedToken,
    jti,
    ...meta,
    expires_at: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
  };

  return await RefreshToken.create(refreshTokenData);
};

exports.clearResetOTP = async (userId) => {
  return await User.update(
    {
      reset_password_otp: null,
      reset_password_otp_expires_at: null,
      reset_password_otp_sent_at: null,
    },
    { where: { id: userId } },
  );
};

exports.updateUserPassword = async (userId, newPassword) => {
  const user = await User.findByPk(userId);

  return await user.update({
    password: newPassword,
  });
};

exports.revokeAllUserSessions = async (userId) => {
  return await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId, is_revoked: false } },
  );
};

exports.findRefreshTokenByJti = async (jti) => {
  return await RefreshToken.findOne({ where: { jti } });
};

exports.revokeRefreshToken = async (jti) => {
  return await RefreshToken.update(
    { is_revoked: true },
    { where: { jti, is_revoked: false } },
  );
};
