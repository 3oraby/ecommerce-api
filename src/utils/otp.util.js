const crypto = require("crypto");

exports.generateOTP = () => {
  const OTP_LENGTH = parseInt(process.env.OTP_LENGTH, 10) || 6;
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;

  return crypto.randomInt(min, max).toString();
};

exports.hashOTP = (otp) => {
  if (typeof otp !== "string" || otp.trim() === "") {
    throw new Error("OTP must be a non-empty string");
  }

  return crypto.createHash("sha256").update(otp).digest("hex");
};

exports.verifyOTP = (plainOTP, hashedOTP) => {
  if (!plainOTP || !hashedOTP) return false;

  const hashedInput = crypto
    .createHash("sha256")
    .update(plainOTP.toString())
    .digest("hex");

  return hashedInput === hashedOTP;
};
