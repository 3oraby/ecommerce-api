const express = require("express");
const notificationController = require("./notification.controller");
const validate = require("../../middlewares/validate.middleware");
const {
  saveFcmTokenSchema,
  testNotificationSchema,
} = require("./notification.validation");
const { authenticate } = require("../../middlewares/authenticate.middleware");

const router = express.Router();

router.use(authenticate);

router.post(
  "/save-fcm-token",
  validate(saveFcmTokenSchema),
  notificationController.saveFcmToken
);

router.post(
  "/test",
  validate(testNotificationSchema),
  notificationController.testNotification
);

module.exports = router;
