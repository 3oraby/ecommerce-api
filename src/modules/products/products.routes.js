const express = require("express");
const productsController = require("./products.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const {
  checkSellerProfileExists,
} = require("../../middlewares/checkSellerProfileExists.middleware");
const {
  checkProductOwnership,
} = require("../../middlewares/checkProductOwnership.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createProductSchema,
  updateProductSchema,
  paramsSchema,
  categoryParamsSchema,
} = require("./products.validation");
const reviewsRouter = require("../reviews/reviews.routes");

const router = express.Router({ mergeParams: true });

router.use("/:productId/reviews", reviewsRouter);

router.use(authenticate);

router.get("/search", productsController.searchProducts);

router.get(
  "/seller",
  restrictTo(Roles.SELLER),
  checkSellerProfileExists,
  productsController.getSellerProducts,
);

router.get(
  "/",
  validate(categoryParamsSchema),
  productsController.getProductsByCategory,
);

router.get("/all", productsController.getProducts);

router.get("/home", restrictTo(Roles.CUSTOMER,Roles.ADMIN), productsController.getHomeData);

router.get("/:id", validate(paramsSchema), productsController.getProductById);

router.post(
  "/",
  restrictTo(Roles.SELLER),
  checkSellerProfileExists,
  validate(createProductSchema),
  productsController.createProduct,
);

router.patch(
  "/:id",
  restrictTo(Roles.SELLER),
  validate(updateProductSchema),
  checkSellerProfileExists,
  checkProductOwnership,
  productsController.updateProduct,
);

router.delete(
  "/:id",
  restrictTo(Roles.SELLER),
  validate(paramsSchema),
  checkSellerProfileExists,
  checkProductOwnership,
  productsController.deleteProduct,
);

module.exports = router;
