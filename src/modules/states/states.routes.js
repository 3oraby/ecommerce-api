const express = require("express");
const statesController = require("./states.controller");
const validate = require("../../middlewares/validate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createStateSchema,
  updateStateSchema,
  stateIdParamsSchema,
  getStatesByCountryParamsSchema,
  countryIdParamsSchema,
} = require("./states.validation");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const citiesRouter = require("../cities/cities.routes");

const router = express.Router({ mergeParams: true });

router.get(
  "/all",
  authenticate,
  restrictTo(Roles.ADMIN),
  statesController.getStates,
);

// --- PUBLIC ---
router.get(
  "/",
  validate(countryIdParamsSchema),
  statesController.getStatesByCountry,
);

router.get(
  "/:id",
  validate(stateIdParamsSchema),
  statesController.getStateById,
);

router.use("/:stateId/cities", citiesRouter);

// --- ADMIN ONLY ---
router.use(authenticate);
router.use(restrictTo(Roles.ADMIN));

router.post("/", validate(createStateSchema), statesController.createState);

router.patch("/:id", validate(updateStateSchema), statesController.updateState);

router.delete(
  "/:id",
  validate(getStatesByCountryParamsSchema),
  statesController.deleteState,
);

module.exports = router;
