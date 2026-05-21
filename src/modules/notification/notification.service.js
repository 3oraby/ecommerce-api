const notificationRepository = require("./notification.repository");
const centralNotificationService = require("../../services/notifications/notification.service");
const QueryBuilder = require("../../utils/queryBuilder");
const { normalizeQuery } = require("../../utils/query.util");
const cacheKeyBuilder = require("../../services/cache/cacheKeys.util");
const { cacheableList, cacheOrFetch } = require("../../services/cache/cache.helper");
const { invalidateNotificationsCache } = require("../../services/cache/cacheInvalidation.helper");
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

exports.getNotifications = async (userId, query = {}) => {
  const qb = new QueryBuilder(query).paginate();
  const normalized = qb.normalize();
  const normQuery = normalizeQuery(normalized);

  const cacheKey = cacheKeyBuilder.notifications(userId, normQuery);

  return cacheableList({
    cacheKey,
    repositoryCall: () =>
      notificationRepository.getNotifications(
        userId,
        normalized.pagination.limit,
        normalized.pagination.offset
      ),
    queryBuilderResult: normalized,
  });
};

exports.markAsRead = async (notificationId, userId) => {
  const notification = await notificationRepository.getNotificationById(notificationId, userId);
  if (!notification) {
    throw new ApiError("Notification not found", HttpStatus.NotFound);
  }

  if (notification.is_read) {
    throw new ApiError("Notification is already read", HttpStatus.BadRequest);
  }

  const result = await notificationRepository.markAsRead(notificationId, userId);
  await invalidateNotificationsCache(userId);
  return result;
};

exports.markAllAsRead = async (userId) => {
  const result = await notificationRepository.markAllAsRead(userId);
  await invalidateNotificationsCache(userId);
  return result;
};

exports.getUnreadCount = async (userId) => {
  const cacheKey = cacheKeyBuilder.notificationUnreadCount(userId);
  return cacheOrFetch(cacheKey, () => notificationRepository.getUnreadCount(userId));
};
