const notificationRepository = require("./notification.repository");
const notificationProvider = require("../../services/notifications/notification.provider");

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

exports.sendPushNotification = async ({ userId, title, body, data = {} }) => {
  try {
    const userTokens = await notificationRepository.getUserTokens(userId);

    if (!userTokens || userTokens.length === 0) {
      return null;
    }

    const tokens = userTokens.map((t) => t.fcm_token);

    const payload = { title, body, data };
    const response = await notificationProvider.sendPushNotification(tokens, payload);

    if (response && response.failedTokens && response.failedTokens.length > 0) {
      await notificationRepository.removeTokens(response.failedTokens);
      console.log(`Cleaned up ${response.failedTokens.length} invalid tokens for user ${userId}`);
    }

    return response;
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error.message);
    return null;
  }
};
