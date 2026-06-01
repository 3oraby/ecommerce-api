const amqp = require('amqplib');

class RabbitMQProvider {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    this.isConnecting = false;
    this.reconnectTimeout = null;
  }

  async connect() {
    if (this.connection || this.isConnecting) return;
    this.isConnecting = true;

    try {
      console.log('Connecting to RabbitMQ...');
      this.connection = await amqp.connect(this.url);
      
      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.connection = null;
        this.channel = null;
        this.reconnect();
      });

      this.connection.on('close', () => {
        console.warn('RabbitMQ connection closed.');
        this.connection = null;
        this.channel = null;
        this.reconnect();
      });

      console.log('RabbitMQ connected successfully.');
      this.channel = await this.connection.createChannel();
      console.log('RabbitMQ channel created.');
      
      this.isConnecting = false;
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error.message);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    console.log('Attempting to reconnect to RabbitMQ in 5 seconds...');
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  async getChannel() {
    if (!this.channel) {
      await this.connect();
    }
    return this.channel;
  }

  async assertQueue(queue, options = {}) {
    const channel = await this.getChannel();
    await channel.assertQueue(queue, options);
  }

  async publish(queue, message, options = {}) {
    const channel = await this.getChannel();
    const buffer = Buffer.from(JSON.stringify(message));
    return channel.sendToQueue(queue, buffer, {
      persistent: true,
      ...options,
    });
  }

  async consume(queue, callback, options = {}) {
    const channel = await this.getChannel();
    await channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content, msg);
        } catch (error) {
          console.error(`Consumer error for queue ${queue}:`, error);
          // Don't ack here, handle it in the service layer or callback
        }
      }
    }, options);
  }

  async ack(msg) {
    if (this.channel) {
      this.channel.ack(msg);
    }
  }

  async nack(msg, allUpTo = false, requeue = false) {
    if (this.channel) {
      this.channel.nack(msg, allUpTo, requeue);
    }
  }

  async close() {
    console.log('Closing RabbitMQ connection...');
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('RabbitMQ connection closed successfully.');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

// Singleton instance
const rabbitMQProvider = new RabbitMQProvider();
module.exports = rabbitMQProvider;
