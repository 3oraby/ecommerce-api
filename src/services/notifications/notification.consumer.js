const queueService = require('../queue/queue.service');
const { QUEUES, RETRY_STRATEGY } = require('../queue/constants/queue.constants');
const notificationService = require('./notification.service');

const processNotificationJob = async (jobPayload) => {
  console.log(`[NotificationConsumer] Processing notification for user ${jobPayload.userId} of type ${jobPayload.type}`);
  
  try {
    await notificationService.processNotification(jobPayload);
    console.log(`[NotificationConsumer] Successfully processed notification for user ${jobPayload.userId}`);
  } catch (error) {
    console.error(`[NotificationConsumer] Error processing notification:`, error.message);
    throw error;
  }
};

const startNotificationConsumer = async () => {
  try {
    console.log('Starting notification consumer worker...');
    
    await queueService.setupQueueWithRetry(QUEUES.NOTIFICATIONS, RETRY_STRATEGY);

    await queueService.consume(QUEUES.NOTIFICATIONS, processNotificationJob, RETRY_STRATEGY);
    
    console.log('Notification consumer worker started successfully.');
  } catch (error) {
    console.error('Failed to start notification consumer worker:', error);
  }
};

module.exports = {
  startNotificationConsumer,
};

