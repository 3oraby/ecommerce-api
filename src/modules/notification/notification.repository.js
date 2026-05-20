const NotificationToken = require("./notificationToken.model");
const Notification = require("./notification.model");

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

exports.createNotification = async (data) => {
  return await Notification.create(data);
};

exports.getNotificationById = async (id, userId) => {
  return await Notification.findOne({ where: { id, user_id: userId } });
}

exports.getNotifications = async (userId, limit, offset) => {
  return await Notification.findAndCountAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
};

exports.markAsRead = async (id, userId) => {
  return await Notification.update(
    { is_read: true },
    { where: { id, user_id: userId } }
  );
};

exports.markAllAsRead = async (userId) => {
  return await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );
};

exports.getUnreadCount = async (userId) => {
  return await Notification.count({
    where: { user_id: userId, is_read: false },
  });
};
