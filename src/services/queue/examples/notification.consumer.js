const queueService = require('../queue.service');
const { QUEUES, RETRY_STRATEGY } = require('../constants/queue.constants');

const processNotification = async (data) => {
  console.log(`Processing notification for user ${data.userId} of type ${data.type}`);
  
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const random = Math.random();
  if (random < 0.3) {
    throw new Error('Random simulated processing failure');
  }

  console.log(`Successfully processed notification for user ${data.userId}`);
};

const startNotificationConsumer = async () => {
  try {
    console.log('Starting notification consumer...');
    
    await queueService.setupQueueWithRetry(QUEUES.NOTIFICATIONS, RETRY_STRATEGY);

    await queueService.consume(QUEUES.NOTIFICATIONS, processNotification, RETRY_STRATEGY);
    
    console.log('Notification consumer started successfully.');
  } catch (error) {
    console.error('Failed to start notification consumer:', error);
  }
};

module.exports = {
  startNotificationConsumer,
};

