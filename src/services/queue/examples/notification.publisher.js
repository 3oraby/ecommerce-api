const queueService = require('../queue.service');
const { QUEUES } = require('../constants/queue.constants');

const publishNotification = async (userId, type, payload) => {
  const message = {
    userId,
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log(`Publishing notification for user ${userId} of type ${type}`);
    await queueService.publish(QUEUES.NOTIFICATIONS, message);
    console.log('Notification published successfully.');
  } catch (error) {
    console.error('Failed to publish notification:', error);
    throw error;
  }
};

module.exports = {
  publishNotification,
};
