const express = require("express");
const app = express();
const ApiError = require("./utils/apiError");
const globalErrorHandler = require("./middlewares/globalError.middleware");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const HttpStatus = require("./enums/httpStatus");

const userRouter = require("./modules/user/user.routes");

// Enable trust proxy for rate limiting & secure cookies
// app.set("trust proxy", true);

// GLOBAL MIDDLEWARES

// // CORS
// app.use(cors());
// app.options(/.*/, cors());

// // Security headers
// app.use(helmet());

// // Development logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// Rate limiting
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: {
//     status: "fail",
//     message: "Too many requests from this IP, please try again in an hour!",
//   },
// });
// app.use("/api", limiter);

// // Body parsers
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// app.use(cookieParser());

// // Data sanitization against XSS
// app.use(xss());

// // Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [],
//   }),
// );

// // Compress responses
// app.use(compression());

// Serve static files
// app.use(express.static(path.join(__dirname, "public")));

// ROUTES

app.use("/api/v1/users", userRouter);

// ERROR HANDLING

// Catch all unhandled routes
app.all(/.*/, (req, res, next) => {
  next(
    new ApiError(
      `Cannot find ${req.originalUrl} on this server!`,
      HttpStatus.NotFound,
    ),
  );
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
