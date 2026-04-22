const express = require("express");
const cartController = require("./cart.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  addToCartSchema,
  updateCartItemSchema,
  paramsSchema,
} = require("./cart.validation");

const router = express.Router();

router.use(authenticate);
router.use(restrictTo(Roles.CUSTOMER));

router.get("/", cartController.getCart);

router.post(
  "/items/:productId",
  validate(addToCartSchema),
  cartController.addToCart
);

router.patch(
  "/items/:productId",
  validate(updateCartItemSchema),
  cartController.updateCartItem
);

router.delete(
  "/items/:productId",
  validate(paramsSchema),
  cartController.deleteFromCart
);

module.exports = router;
