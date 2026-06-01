const QUEUES = {
  NOTIFICATIONS: 'notifications',
  NOTIFICATIONS_DLQ: 'notifications.dlq',
};

const EXCHANGES = {
  NOTIFICATIONS: 'notifications.exchange',
};

const ROUTING_KEYS = {
  NOTIFICATIONS_SEND: 'notifications.send',
};

const RETRY_STRATEGY = [
  { queue: 'notifications.retry.1m', delay: 60000 },
  { queue: 'notifications.retry.5m', delay: 300000 },
  { queue: 'notifications.retry.15m', delay: 900000 },
  { queue: 'notifications.retry.1h', delay: 3600000 },
  { queue: 'notifications.retry.6h', delay: 21600000 },
  { queue: 'notifications.retry.24h', delay: 86400000 },
];

const getRetryStrategy = (baseQueueName) => {
  const delays = [
    { suffix: '1m', delay: 60000 },
    { suffix: '5m', delay: 300000 },
    { suffix: '15m', delay: 900000 },
    { suffix: '1h', delay: 3600000 },
    { suffix: '6h', delay: 21600000 },
    { suffix: '24h', delay: 86400000 },
  ];
  return delays.map(item => ({
    queue: `${baseQueueName}.retry.${item.suffix}`,
    delay: item.delay,
  }));
};

module.exports = {
  QUEUES,
  EXCHANGES,
  ROUTING_KEYS,
  RETRY_STRATEGY,
  getRetryStrategy,
};

