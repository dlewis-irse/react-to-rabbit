import { applicationInitializer } from '@marketing/web-dev-node-config';
import { connectRabbitMQ } from './connection.js';

export default async function registerHandlers (handlers) {
  try {
    const { logger } = await applicationInitializer.init({
      localConfigPath: './credentials.json',
      secretKey: process.env.SECRET_KEY,
      secretRegion: 'us-west-2',
      mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
      loggerAppName: process.env.VITE_APPLICATION_NAME,
      mongoCollections: []
    });

    const { channel } = await connectRabbitMQ();

    for (const { eventName, handler } of handlers) {
      // Create a queue for the event
      const queue = eventName;
      await channel.assertQueue(queue, { durable: true });

      // Bind the queue to the exchange with the event name as the routing key
      const exchange = 'requests';
      await channel.bindQueue(queue, exchange, eventName);

      logger.info(`Handler registered for event: ${eventName}`);

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
          logger.error(`Error in handler for event ${eventName}:`, error);
          channel.publish(
            'responses',
            '',
            Buffer.from(JSON.stringify({ requestId, error: error.message, isFinal: true }))
          );
        }

        channel.ack(msg);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to register handlers:', error);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}
