const User = require("../user/user.model");
const RefreshToken = require("./refreshToken.model");
const AccountStatus = require("../../enums/accountStatus.enum");

exports.getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

exports.createUser = async (userData) => {
  return await User.create(userData);
};

exports.saveOTP = async (userId, hashedOTP) => {
  const otpExpiresIn = parseInt(process.env.OTP_EXPIRES_IN, 10) || 10;

  const expires = new Date(Date.now() + otpExpiresIn * 60 * 1000);

  return await User.update(
    {
      otp: hashedOTP,
      otp_expires_at: expires,
      otp_sent_at: new Date(),
    },
    { where: { id: userId } },
  );
};

exports.verifyUser = async (userId) => {
  return await User.update(
    {
      account_status: AccountStatus.ACTIVE,
      otp: null,
      otp_expires_at: null,
      otp_sent_at: null,
    },
    { where: { id: userId } },
  );
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

  console.log("data before save in refreshToken model: ", refreshTokenData);

  return await RefreshToken.create(refreshTokenData);
};
