const QUEUES = {
  NOTIFICATIONS: 'notifications',
  NOTIFICATIONS_RETRY: 'notifications.retry',
  NOTIFICATIONS_DLQ: 'notifications.dlq',
};

const EXCHANGES = {
  NOTIFICATIONS: 'notifications.exchange',
};

const ROUTING_KEYS = {
  NOTIFICATIONS_SEND: 'notifications.send',
};

module.exports = {
  QUEUES,
  EXCHANGES,
  ROUTING_KEYS,
};
