const express = require("express");
const statesController = require("./states.controller");
const validate = require("../../middlewares/validate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createStateSchema,
  updateStateSchema,
  stateIdParamsSchema,
} = require("./states.validation");
const { authenticate } = require("../../middlewares/authenticate.middleware");

const router = express.Router({ mergeParams: true });

// --- PUBLIC ---
router.get("/", statesController.getStatesByCountry);
router.get(
  "/:id",
  validate(stateIdParamsSchema),
  statesController.getStateById
);

// --- ADMIN ONLY ---
router.use(authenticate);
router.use(restrictTo(Roles.ADMIN));
router.post(
  "/",
  validate(createStateSchema),
  statesController.createState
);

router.patch(
  "/:id",
  validate(updateStateSchema),
  statesController.updateState
);

router.delete(
  "/:id",
  validate(stateIdParamsSchema),
  statesController.deleteState
);

module.exports = router;
