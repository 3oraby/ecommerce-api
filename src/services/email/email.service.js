const { sendEmail } = require('./sendEmail');
const { renderTemplate } = require('./email.templates');

exports.sendOtpEmail = async (user, otp) => {
  const html = renderTemplate('otp_email', { name: user.name, otp });
  return await sendEmail({
    to: user.email,
    subject: 'Your OTP Code',
    html,
  });
};

exports.sendVerifyEmail = async (user, verifyUrl) => {
  const html = renderTemplate('verify_email', { name: user.name, verifyUrl });
  return await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    html,
  });
};

exports.sendForgotPasswordEmail = async (user, resetUrl) => {
  const html = renderTemplate('forget_password', { name: user.name, resetUrl });
  return await sendEmail({
    to: user.email,
    subject: 'Reset Your Password',
    html,
  });
};