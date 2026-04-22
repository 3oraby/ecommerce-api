const express = require("express");
const favoritesController = require("./favorites.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { paramsSchema } = require("./favorites.validation");

const router = express.Router();

router.use(authenticate);

router.get("/", favoritesController.getMyFavorites);

router.post(
  "/:productId",
  validate(paramsSchema),
  favoritesController.addToFavorites,
);

router.delete(
  "/:productId",
  validate(paramsSchema),
  favoritesController.removeFromFavorites,
);

module.exports = router;
