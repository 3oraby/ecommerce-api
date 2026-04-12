const User = require("../user/user.model");
const AccountStatus = require("../../enums/accountStatus.enum");

exports.getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

exports.createUser = async (userData) => {
  return await User.create(userData);
};

exports.saveOTP = async (userId, hashedOTP) => {
  const OTP_EXPIRES_IN = parseInt(process.env.OTP_EXPIRES_IN, 10) || 10;

  const expires = new Date(Date.now() + OTP_EXPIRES_IN * 60 * 1000);

  return await User.update(
    {
      otp: hashedOTP,
      otp_expires_at: expires,
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
    },
    { where: { id: userId } },
  );
};
