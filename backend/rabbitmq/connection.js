import rabbitmqConfig from '../config/rabbitmq.js';
import amqp from 'amqplib';

export async function connectRabbitMQ () {
  try {
    const connection = await amqp.connect(rabbitmqConfig.url);
    const channel = await connection.createChannel();

    // Create exchange
    await channel.assertExchange(rabbitmqConfig.exchange, 'direct', { durable: true });

    // Create response exchange
    await channel.assertExchange(rabbitmqConfig.responseExchange, 'direct', { durable: true });

    return { connection, channel };
  } catch (error) {
    console.error('RabbitMQ connection failed:', error);
    throw error;
  }
}
