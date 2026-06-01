const notificationRepository = require("../../modules/notification/notification.repository");
const notificationProvider = require("./notification.provider");
const notificationTypes = require("../../enums/notificationTypes.enum");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const {
  invalidateNotificationsCache,
} = require("../cache/cacheInvalidation.helper");

class NotificationService {
  async createNotification(userId, payload) {
    try {
      const { title, body, type, data } = payload;
      const validTypes = Object.values(notificationTypes);

      if (!validTypes.includes(type)) {
        throw new ApiError("Invalid notification type", HttpStatus.BadRequest);
      }

      const notification = await notificationRepository.createNotification({
        user_id: userId,
        title,
        body,
        type,
        data: data || {},
      });

      await invalidateNotificationsCache(userId);

      return notification;
    } catch (error) {
      console.error(
        `Failed to save notification for user ${userId}:`,
        error.message,
      );
      return null;
    }
  }

  async processNotification(payload) {
    const { userId } = payload;
    const notification = await this.createNotification(userId, payload);

    try {
      const userTokens = await notificationRepository.getUserTokens(userId);

      if (userTokens && userTokens.length > 0) {
        const tokens = userTokens.map((t) => t.fcm_token);

        const pushResponse = await notificationProvider.sendPushNotification(
          tokens,
          {
            title: payload.title,
            body: payload.body,
            data: payload.data,
          },
        );

        if (
          pushResponse &&
          pushResponse.failedTokens &&
          pushResponse.failedTokens.length > 0
        ) {
          await notificationRepository.removeTokens(pushResponse.failedTokens);
          console.log(
            `Cleaned up ${pushResponse.failedTokens.length} invalid tokens for user ${userId}`,
          );
        }
      }
    } catch (error) {
      console.error(
        `Failed to send push notification to user ${userId}:`,
        error.message,
      );
    }

    return notification;
  }
}

module.exports = new NotificationService();
