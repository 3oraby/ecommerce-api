const notificationRepository = require("./notification.repository");
const centralNotificationService = require("../../services/notifications/notification.service");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

exports.saveFcmToken = async (userId, fcmToken) => {
  const existingToken = await notificationRepository.findToken(fcmToken);

  if (existingToken) {
    if (existingToken.user_id !== userId) {
      await notificationRepository.updateTokenUser(existingToken.id, userId);
    }
    return existingToken;
  }

  return await notificationRepository.createToken(userId, fcmToken);
};

exports.sendPushNotification = async (payload) => {
  return await centralNotificationService.sendNotification(payload.userId, payload);
};

exports.getNotifications = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await notificationRepository.getNotifications(userId, limit, offset);

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalItemsInCurrentPage: rows.length,
    notifications: rows,
  };
};

exports.markAsRead = async (notificationId, userId) => {
  const notification = await notificationRepository.getNotificationById(notificationId, userId);
  if (!notification) {
    throw new ApiError("Notification not found", HttpStatus.NotFound);
  }

  if (notification.is_read) {
    throw new ApiError("Notification is already read", HttpStatus.BadRequest);
  }

  return await notificationRepository.markAsRead(notificationId, userId);
};

exports.markAllAsRead = async (userId) => {
  return await notificationRepository.markAllAsRead(userId);
};

exports.getUnreadCount = async (userId) => {
  return await notificationRepository.getUnreadCount(userId);
};
