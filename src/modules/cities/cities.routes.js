const express = require("express");
const citiesController = require("./cities.controller");
const validate = require("../../middlewares/validate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createCitySchema,
  updateCitySchema,
  cityIdParamsSchema,
  getCitiesByStateParamsSchema,
  stateIdParamsSchema,
} = require("./cities.validation");
const { authenticate } = require("../../middlewares/authenticate.middleware");

const router = express.Router({ mergeParams: true });

router.get(
  "/all",
  authenticate,
  restrictTo(Roles.ADMIN),
  citiesController.getCities,
);

// --- PUBLIC ---
router.get(
  "/",
  validate(stateIdParamsSchema),
  citiesController.getCitiesByState,
);
router.get("/:id", validate(cityIdParamsSchema), citiesController.getCityById);

// --- ADMIN ONLY ---
router.use(authenticate);
router.use(restrictTo(Roles.ADMIN));

router.post("/", validate(createCitySchema), citiesController.createCity);

router.patch("/:id", validate(updateCitySchema), citiesController.updateCity);

router.delete(
  "/:id",
  validate(getCitiesByStateParamsSchema),
  citiesController.deleteCity,
);

module.exports = router;
