const express = require("express");
const countriesController = require("./countries.controller");
const validate = require("../../middlewares/validate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createCountrySchema,
  updateCountrySchema,
  countryIdParamsSchema,
} = require("./countries.validation");
const { authenticate } = require("../../middlewares/authenticate.middleware");

const router = express.Router();

// --- PUBLIC ---
router.get("/", countriesController.getAllCountries);
router.get(
  "/:id",
  validate(countryIdParamsSchema),
  countriesController.getCountryById,
);

// --- ADMIN ONLY ---
router.use(authenticate);
router.use(restrictTo(Roles.ADMIN));

router.post(
  "/",
  validate(createCountrySchema),
  countriesController.createCountry,
);

router.patch(
  "/:id",
  validate(updateCountrySchema),
  countriesController.updateCountry,
);

router.delete(
  "/:id",
  validate(countryIdParamsSchema),
  countriesController.deleteCountry,
);

module.exports = router;
