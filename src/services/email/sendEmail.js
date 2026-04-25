const { createTransporter } = require("./email.transporter");

const transporter = createTransporter();

exports.sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};
