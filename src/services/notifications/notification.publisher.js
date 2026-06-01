const queueService = require('../queue/queue.service');
const { QUEUES } = require('../queue/constants/queue.constants');

class NotificationPublisher {
  async sendNotification(payload) {
    if (!payload.userId || !payload.title || !payload.type) {
      console.warn('Invalid notification payload:', payload);
      return;
    }

    const jobPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log(`Publishing notification job for user ${payload.userId} (Type: ${payload.type})`);
      await queueService.publish(QUEUES.NOTIFICATIONS, jobPayload);
    } catch (error) {
      console.error(`Failed to publish notification job for user ${payload.userId}:`, error.message);
    }
  }

  async sendBulkNotifications(userIds, payload) {
    const promises = userIds.map((userId) => this.sendNotification({ ...payload, userId }));
    await Promise.allSettled(promises);
  }
}

module.exports = new NotificationPublisher();
