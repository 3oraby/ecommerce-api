const express = require("express");
const reviewsController = require("./reviews.controller");
const reviewsValidation = require("./reviews.validation");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validate(reviewsValidation.getProductReviewsSchema),
  reviewsController.getProductReviews,
);

router.use(authenticate);

router.post(
  "/",
  restrictTo(Roles.CUSTOMER),
  validate(reviewsValidation.createReviewSchema),
  reviewsController.createReview,
);

router.patch(
  "/",
  restrictTo(Roles.CUSTOMER),
  validate(reviewsValidation.updateReviewSchema),
  reviewsController.updateReview,
);

router.delete(
  "/",
  restrictTo(Roles.CUSTOMER),
  validate(reviewsValidation.getProductReviewsSchema),
  reviewsController.deleteReview,
);

module.exports = router;
