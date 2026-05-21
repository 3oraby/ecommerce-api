const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const HttpStatus = require("../../enums/httpStatus.enum");
const notificationService = require("./notification.service");
const notificationTypes = require("../../enums/notificationTypes.enum");

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
    type: notificationTypes.TEST,
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

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const data = await notificationService.getNotifications(userId, req.query);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Notifications fetched successfully",
    data,
  });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  await notificationService.markAsRead(id, userId);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Notification marked as read",
  });
});

exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  await notificationService.markAllAsRead(userId);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "All notifications marked as read",
  });
});

exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const count = await notificationService.getUnreadCount(userId);

  sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Unread count fetched successfully",
    data: { count },
  });
});
