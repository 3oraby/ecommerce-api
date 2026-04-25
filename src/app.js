const express = require("express");
const app = express();

const globalErrorHandler = require("./middlewares/globalError.middleware");
const urlNotFoundMiddleware = require("./middlewares/urlNotFound.middleware");

const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const path = require("path");

// ROUTES
const userRouter = require("./modules/user/user.routes");
const authRouter = require("./modules/auth/auth.routes");
const countryRouter = require("./modules/countries/countries.routes");
const stateRouter = require("./modules/states/states.routes");
const cityRouter = require("./modules/cities/cities.routes");
const addressRouter = require("./modules/addresses/addresses.routes");
const categoryRouter = require("./modules/categories/categories.routes");
const sellerRouter = require("./modules/sellers/sellers.routes");
const productRouter = require("./modules/products/products.routes");
const favoriteRouter = require("./modules/favorites/favorites.routes");
const cartRouter = require("./modules/cart/cart.routes");
const ordersRouter = require("./modules/orders/orders.routes");
const reviewsRouter = require("./modules/reviews/reviews.routes");

// trust proxy (important if deployed behind nginx / render / railway)
app.set("trust proxy", 1);

// Enable CORS
app.use(cors());
app.options(/.*/, cors());

// Security headers
app.use(helmet());

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP
  windowMs: 60 * 60 * 1000, // 1 hour
  message: {
    status: "fail",
    message: "Too many requests, try again later.",
  },
});
app.use("/api", limiter);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookies
app.use(cookieParser());

// Data sanitization (XSS)
app.use(xss());

// Prevent HTTP param pollution
app.use(
  hpp({
    whitelist: ["price", "ratingsAverage", "ratingsQuantity", "sold"],
  }),
);

// Compress responses
app.use(compression());

// Static files (optional)
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/countries", countryRouter);
app.use("/api/v1/states", stateRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/sellers", sellerRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/favorites", favoriteRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/reviews", reviewsRouter);

// Catch all unhandled routes
app.all(/.*/, urlNotFoundMiddleware);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
