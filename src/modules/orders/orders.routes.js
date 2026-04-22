const express = require("express");
const ordersController = require("./orders.controller");
const ordersValidation = require("./orders.validation");
const Roles = require("../../enums/roles.enum");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");

const router = express.Router();

router.use(authenticate);

// USER Routes
router.post(
  "/checkout",
  restrictTo(Roles.CUSTOMER),
  validate(ordersValidation.checkoutSchema),
  ordersController.checkout,
);

router.get("/me", restrictTo(Roles.CUSTOMER), ordersController.getMyOrders);

router.get(
  "/myCanceled",
  restrictTo(Roles.CUSTOMER),
  ordersController.getMyCanceledOrders,
);

router.patch(
  "/:id/cancel",
  restrictTo(Roles.CUSTOMER),
  validate(ordersValidation.paramIdSchema),
  ordersController.cancelOrder,
);

// SELLER Routes
router.get(
  "/seller",
  restrictTo(Roles.SELLER),
  ordersController.getSellerOrders,
);

// ADMIN Routes
router.patch(
  "/:id/status",
  restrictTo(Roles.ADMIN),
  validate(ordersValidation.updateStatusSchema),
  ordersController.updateOrderStatus,
);

// Shared Route (USER, SELLER, ADMIN)
router.get(
  "/:id",
  validate(ordersValidation.paramIdSchema),
  ordersController.getOrderById,
);

router.get(
  "/:id/summary",
  validate(ordersValidation.paramIdSchema),
  ordersController.getOrderSummary,
);

module.exports = router;
