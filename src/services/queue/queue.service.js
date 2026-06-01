const rabbitMQProvider = require('./providers/rabbitmq.provider');

class QueueService {
  constructor() {
    this.provider = rabbitMQProvider;
  }

  async connect() {
    await this.provider.connect();
  }

  async setupQueueWithRetry(baseQueueName, options = { retryDelay: 5000 }) {
    const mainQueue = baseQueueName;
    const retryQueue = `${baseQueueName}.retry`;
    const dlqQueue = `${baseQueueName}.dlq`;
    const exchange = `${baseQueueName}.exchange`;

    const channel = await this.provider.getChannel();

    await channel.assertQueue(dlqQueue, { durable: true });

    await channel.assertExchange(exchange, 'direct', { durable: true });
    
    await channel.assertQueue(retryQueue, {
      durable: true,
      deadLetterExchange: exchange,
      deadLetterRoutingKey: mainQueue,
      messageTtl: options.retryDelay,
    });

    await channel.assertQueue(mainQueue, {
      durable: true,
      deadLetterExchange: '', 
      deadLetterRoutingKey: dlqQueue, 
    });

    await channel.bindQueue(mainQueue, exchange, mainQueue);
  }

  async publish(queue, data, options = {}) {
    return this.provider.publish(queue, data, options);
  }

  async consume(queue, handler, maxRetries = 3) {
    await this.provider.consume(queue, async (data, msg) => {
      try {
        await handler(data);
        await this.provider.ack(msg);
      } catch (error) {
        console.error(`Error processing message from ${queue}:`, error.message);
        await this.handleFailure(queue, data, msg, error, maxRetries);
      }
    });
  }

  async handleFailure(queue, data, msg, error, maxRetries) {
    const headers = msg.properties.headers || {};
    const retryCount = headers['x-retry-count'] || 0;

    if (retryCount < maxRetries) {
      console.log(`Retrying message from ${queue} (Attempt ${retryCount + 1} of ${maxRetries})`);
      
      const retryQueue = `${queue}.retry`;
      
      await this.provider.publish(retryQueue, data, {
        headers: {
          ...headers,
          'x-retry-count': retryCount + 1,
          'x-original-error': error.message,
        },
      });
      
      await this.provider.ack(msg);
    } else {
      console.error(`Max retries (${maxRetries}) exceeded for message from ${queue}. Moving to DLQ.`);
      
      const dlqQueue = `${queue}.dlq`;
      
      await this.provider.publish(dlqQueue, data, {
        headers: {
          ...headers,
          'x-retry-count': retryCount,
          'x-final-error': error.message,
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
