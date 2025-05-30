import WebSocket from 'ws';
import { applicationInitializer } from '@marketing/web-dev-node-config';
import { connectRabbitMQ } from '../shared/nodejs/rabbit-mq/init-rabbit-mq-connection.js';
import { validateConfig } from '../shared/nodejs/validateConfig.js';

try {
  const { credentials, logger } = await applicationInitializer.init({
    localConfigPath: './credentials.json',
    secretKey: process.env.SECRET_KEY,
    secretRegion: 'us-west-2',
    mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
    loggerAppName: process.env.VITE_APPLICATION_NAME,
    mongoCollections: []
  });

  validateConfig(credentials);

  const wsPort = process.env.VITE_SERVER_PORT || 8080;
  const wss = new WebSocket.Server({ port: wsPort });

  // Connect to RabbitMQ
  const { channel } = await connectRabbitMQ();

  // Create a queue for responses
  const responseQueue = 'websocket_responses';
  await channel.assertQueue(responseQueue, { durable: true });

  // Bind the response queue to the responses exchange
  const responseExchange = 'responses';
  await channel.bindQueue(responseQueue, responseExchange, '');

  const pendingRequests = [];

  wss.on('connection', (ws) => {
    logger.info('Client connected');

    ws.on('close', () => {
      logger.info('Client disconnected');
    });

    ws.on('message', async (message) => {
      try {
        const request = JSON.parse(message.toString());
        const { requestId, requestType, payload } = request;

        if (requestId === 'client-log') {
          logger[request.level](request.message);
          return;
        }

        pendingRequests.push(request);


        logger.info(`Publishing request:${JSON.stringify(request)}`);
        // Publish the request to RabbitMQ
        channel.publish(
          'requests',
          requestType,
          Buffer.from(JSON.stringify({ requestId, payload })),
          {
            replyTo: responseQueue
          }
        );

        // Use a unique consumer tag for each request to ensure proper cleanup
        const consumerTag = `consumer-${requestId}-${Date.now()}`;

        await channel.consume(
          responseQueue,
          (msg) => {
            const response = JSON.parse(msg.content.toString());
            logger.info(`Received response from RabbitMQ:${JSON.stringify(response)}`);
            if (response.requestId === requestId) {
              ws.send(JSON.stringify(response));
              channel.ack(msg);
              channel.cancel(consumerTag);
            }
          },
          { noAck: false, consumerTag }
        );
      } catch (error) {
        logger.error('Error handling message:', error);
        ws.send(JSON.stringify({ status: 'error', error: error.message }));
      }
    });
  });

  logger.info(`WebSocket server running on *:${wsPort}`);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Server failed to start:', error);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}
