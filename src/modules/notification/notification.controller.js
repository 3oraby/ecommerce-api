const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const notificationService = require("./notification.service");

exports.saveFcmToken = asyncHandler(async (req, res, next) => {
  const { fcmToken } = req.body;
  const userId = req.user.id;

  await notificationService.saveFcmToken(userId, fcmToken);

  sendResponse({
    res,
    statusCode: HttpStatus.CREATED,
    message: "FCM token saved successfully",
  });
});

exports.testNotification = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const response = await notificationService.sendPushNotification({
    userId,
    title: "Test Notification",
    body: "Firebase notification system is working successfully.",
    data: { test: "true" }
  });

  if (!response) {
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "No devices registered for this user.",
    });
  }

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Test push notification sent",
    data: {
      successCount: response.successCount,
      failureCount: response.failureCount,
    }
  });
});
