import rabbitmqConfig from '../config/rabbitmq.js';
import amqp from 'amqplib';

export async function connectRabbitMQ () {
  let connection;
  let channel;

  async function createConnection() {
    try {
      connection = await amqp.connect(rabbitmqConfig.url);
      channel = await connection.createChannel();

      // Create exchange
      await channel.assertExchange(rabbitmqConfig.exchange, 'direct', { durable: true });

      // Create response exchange
      await channel.assertExchange(rabbitmqConfig.responseExchange, 'direct', { durable: true });

      console.log('RabbitMQ connection established');

      // Handle connection close
      connection.on('close', async () => {
        console.error('RabbitMQ connection closed. Attempting to reconnect...');
        await reconnect();
      });

      return { connection, channel };
    } catch (error) {
      console.error('RabbitMQ connection failed:', error);
      throw error;
    }
  }

  async function reconnect() {
    try {
      await createConnection();
    } catch (error) {
      console.error('Reconnection attempt failed. Retrying in 5 seconds...', error);
      setTimeout(reconnect, 5000);
    }
  }

  return await createConnection();
}
