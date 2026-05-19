const NotificationToken = require("./notificationToken.model");

exports.findToken = async (fcmToken) => {
  return await NotificationToken.findOne({ where: { fcm_token: fcmToken } });
};

exports.createToken = async (userId, fcmToken) => {
  return await NotificationToken.create({
    user_id: userId,
    fcm_token: fcmToken,
  });
};

exports.updateTokenUser = async (tokenId, userId) => {
  return await NotificationToken.update(
    { user_id: userId },
    { where: { id: tokenId } }
  );
};

exports.getUserTokens = async (userId) => {
  return await NotificationToken.findAll({
    where: { user_id: userId },
    attributes: ["fcm_token"],
  });
};

exports.removeTokens = async (tokensToRemove) => {
  if (!tokensToRemove || tokensToRemove.length === 0) return;
  return await NotificationToken.destroy({
    where: { fcm_token: tokensToRemove },
  });
};
