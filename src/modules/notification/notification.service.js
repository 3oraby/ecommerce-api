const notificationRepository = require("./notification.repository");
const firebaseProvider = require("./providers/firebase.provider");

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

    const response = await firebaseProvider.sendPushNotification(tokens, { title, body }, data);

    if (response && response.responses) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (
            error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
          ) {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await notificationRepository.removeTokens(failedTokens);
        console.log(`Cleaned up ${failedTokens.length} invalid Firebase tokens for user ${userId}`);
      }
    }

    return response;
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error.message);
    return null;
  }
};
