const nodemailer = require("nodemailer");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const { renderTemplate } = require("../../utils/templateRenderer.util");

const createDevTransporter = () => {
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

const brevoClient = SibApiV3Sdk.ApiClient.instance;

brevoClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const brevoEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendEmail = async ({ to, subject, templateName, data = {} }) => {
  try {
    const html = renderTemplate({
      folder: "services",
      moduleName: "email",
      templateName,
      data,
    });

    if (process.env.NODE_ENV !== "production") {
      const transporter = createDevTransporter();

      return await transporter.sendMail({
        from: process.env.EMAIL_FROM || "dev@ecommerce.com",
        to,
        subject,
        html,
      });
    }

    await brevoEmailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: "Ecommerce App",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    return true;
  } catch (error) {
    console.error("EMAIL ERROR:", error.response?.body || error.message);

    throw new ApiError(
      "Email provider encountered an error",
      HttpStatus.InternalServerError,
    );
  }
};
