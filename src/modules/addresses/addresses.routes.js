const express = require("express");
const addressesController = require("./addresses.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamsSchema,
} = require("./addresses.validation");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  validate(createAddressSchema),
  addressesController.createAddress
);

router.get(
  "/",
  addressesController.getUserAddresses
);

router.get(
  "/:id",
  validate(addressIdParamsSchema),
  addressesController.getAddressById
);

router.patch(
  "/:id",
  validate(updateAddressSchema),
  addressesController.updateAddress
);

router.delete(
  "/:id",
  validate(addressIdParamsSchema),
  addressesController.deleteAddress
);

router.patch(
  "/:id/default",
  validate(addressIdParamsSchema),
  addressesController.setDefaultAddress
);

module.exports = router;
