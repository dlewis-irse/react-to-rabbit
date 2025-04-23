import { connectRabbitMQ } from '../../../backend/rabbitmq/connection.js';

export default async function registerHandler({ eventName, handler }) {
  try {
    const { channel } = await connectRabbitMQ();

    // Create a queue for the event
    const queue = eventName;
    await channel.assertQueue(queue, { durable: true });

    // Bind the queue to the exchange with the event name as the routing key
    const exchange = 'requests';
    await channel.bindQueue(queue, exchange, eventName);

    console.log(`Handler registered for event: ${eventName}`);

    // Consume messages from the queue
    channel.consume(queue, async (msg) => {
      const { requestId, payload } = JSON.parse(msg.content.toString());

      const sendChunk = (chunk) => {
        channel.publish(
          'responses',
          '',
          Buffer.from(JSON.stringify({ requestId, data: chunk, isFinal: false }))
        );
      };

      try {
        const finalData = await handler({ payload, sendChunk });
        channel.publish(
          'responses',
          '',
          Buffer.from(JSON.stringify({ requestId, data: finalData, isFinal: true }))
        );
      } catch (error) {
        console.error(`Error in handler for event ${eventName}:`, error);
        channel.publish(
          'responses',
          '',
          Buffer.from(JSON.stringify({ requestId, error: error.message, isFinal: true }))
        );
      }

      channel.ack(msg);
    });
  } catch (error) {
    console.error(`Failed to register handler for event ${eventName}:`, error);
    process.exit(1);
  }
}