const nodemailer = require("nodemailer");

exports.createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.GMAIL_HOST,
      port: process.env.GMAIL_PORT,
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  // development
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};
