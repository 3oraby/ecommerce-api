const express = require("express");
const sellersController = require("./sellers.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createSellerSchema,
  updateSellerSchema,
  paramsSchema,
} = require("./sellers.validation");

const router = express.Router();

router.use(authenticate);

// --- SELLER ROUTES ---
router.post(
  "/",
  restrictTo(Roles.SELLER),
  validate(createSellerSchema),
  sellersController.createSellerProfile,
);

router.get(
  "/me",
  restrictTo(Roles.SELLER),
  sellersController.getMySellerProfile,
);

router.patch(
  "/me",
  restrictTo(Roles.SELLER),
  validate(updateSellerSchema),
  sellersController.updateSellerProfile,
);

router.delete(
  "/me",
  restrictTo(Roles.SELLER),
  sellersController.deleteSellerProfile,
);

// --- ADMIN ROUTES ---
router.get("/", restrictTo(Roles.ADMIN), sellersController.getAllSellers);

router.get(
  "/:id",
  restrictTo(Roles.ADMIN),
  validate(paramsSchema),
  sellersController.getSellerProfileById,
);

module.exports = router;
