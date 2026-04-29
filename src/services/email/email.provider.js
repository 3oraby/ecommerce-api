const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");

const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.GMAIL_HOST,
      port: process.env.GMAIL_PORT,
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

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

const transporter = createTransporter();

const renderTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, "templates", `${templateName}.pug`);
  return pug.renderFile(templatePath, data);
};

exports.sendEmail = async ({ to, subject, templateName, data }) => {
  try {
    const html = renderTemplate(templateName, data);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@ecommerce-api.com",
      to,
      subject,
      html,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error("Email provider encountered an error");
  }
};
