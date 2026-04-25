const { sendEmail } = require("./email.provider");

exports.sendEmailVerification = async (user, otp) => {
  const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN || "10", 10);
  const expirationDate = new Date(Date.now() + expiresInMinutes * 60000);
  const expiresAt = expirationDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return await sendEmail({
    to: user.email,
    subject: "Verify Your Email Address",
    templateName: "email-verification",
    data: { name: user.name, otp, expiresAt },
  });
};

exports.sendPasswordReset = async (user, otp) => {
  const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN || "10", 10);
  const expirationDate = new Date(Date.now() + expiresInMinutes * 60000);
  const expiresAt = expirationDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return await sendEmail({
    to: user.email,
    subject: "Reset Your Password",
    templateName: "password-reset",
    data: { name: user.name, otp, expiresAt },
  });
};

exports.sendSecurityAlert = async (user, message) => {
  return await sendEmail({
    to: user.email,
    subject: "Security Alert: Recent Account Activity",
    templateName: "security-alert",
    data: { name: user.name, message },
  });
};