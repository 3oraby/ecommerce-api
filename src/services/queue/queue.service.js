const rabbitMQProvider = require("./providers/rabbitmq.provider");
const { getRetryStrategy } = require("./constants/queue.constants");

class QueueService {
  constructor() {
    this.provider = rabbitMQProvider;
  }

  isHealthy() {
    return !!this.provider.connection && !!this.provider.channel;
  }

  async connect() {
    await this.provider.connect();
  }

  async setupQueueWithRetry(baseQueueName, retryStrategy = null) {
    const strategy = retryStrategy || getRetryStrategy(baseQueueName);
    const mainQueue = baseQueueName;
    const dlqQueue = `${baseQueueName}.dlq`;
    const exchange = `${baseQueueName}.exchange`;

    const channel = await this.provider.getChannel();

    await channel.assertQueue(dlqQueue, { durable: true });

    await channel.assertExchange(exchange, "direct", { durable: true });

    // Assert all retry queues defined in the strategy
    for (const step of strategy) {
      await channel.assertQueue(step.queue, {
        durable: true,
        deadLetterExchange: exchange,
        deadLetterRoutingKey: mainQueue,
        messageTtl: step.delay,
      });
    }

    await channel.assertQueue(mainQueue, {
      durable: true,
      deadLetterExchange: "",
      deadLetterRoutingKey: dlqQueue,
    });

    await channel.bindQueue(mainQueue, exchange, mainQueue);
  }

  async publish(queue, data, options = {}) {
    return this.provider.publish(queue, data, options);
  }

  async consume(queue, handler, retryStrategy = null) {
    let strategy = retryStrategy;
    if (typeof retryStrategy === "number") {
      strategy = Array.from({ length: retryStrategy }, (_, i) => ({
        queue: `${queue}.retry`,
        delay: 5000,
      }));
    } else if (!strategy) {
      strategy = getRetryStrategy(queue);
    }

    await this.provider.consume(queue, async (data, msg) => {
      try {
        await handler(data);
        await this.provider.ack(msg);
      } catch (error) {
        console.error(`Error processing message from ${queue}:`, error.message);
        await this.handleFailure(queue, data, msg, error, strategy);
      }
    });
  }

  async handleFailure(queue, data, msg, error, retryStrategy = null) {
    const headers = msg.properties.headers || {};
    const retryCount = headers["x-retry-count"] || 0;

    let strategy = retryStrategy;
    if (typeof retryStrategy === "number") {
      strategy = Array.from({ length: retryStrategy }, (_, i) => ({
        queue: `${queue}.retry`,
        delay: 5000,
      }));
    } else if (!strategy) {
      strategy = getRetryStrategy(queue);
    }

    if (retryCount < strategy.length) {
      const step = strategy[retryCount];
      const nextQueue = step.queue;
      const nextDelay = step.delay;

      console.log(`[${queue}]`);
      console.log(`Retry #${retryCount}`);
      console.log(`Moving to ${nextQueue}`);
      console.log(`Delay: ${nextDelay} ms`);

      await this.provider.publish(nextQueue, data, {
        headers: {
          ...headers,
          "x-retry-count": retryCount + 1,
          "x-original-error": error.message,
        },
      });

      await this.provider.ack(msg);
    } else {
      console.error(`[${queue}]`);
      console.error(`Max retries exceeded`);
      console.error(`Moved to ${queue}.dlq`);

      const dlqQueue = `${queue}.dlq`;

      await this.provider.publish(dlqQueue, data, {
        headers: {
          ...headers,
          "x-retry-count": retryCount,
          "x-final-error": error.message,
        },
      });

      await this.provider.ack(msg);
    }
  }

  async close() {
    await this.provider.close();
  }
}

const queueService = new QueueService();
module.exports = queueService;
