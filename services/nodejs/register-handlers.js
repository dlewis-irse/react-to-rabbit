import { applicationInitializer } from '@marketing/web-dev-node-config';
import initRabbitMQConnection from '../../shared/nodejs/rabbit-mq/init-rabbit-mq-connection.js';

export default async function registerHandlers(handlers = []) {
  const { logger } = await applicationInitializer.init({
    localConfigPath: './credentials.json',
    secretKey: process.env.SECRET_KEY,
    secretRegion: 'us-west-2',
    mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
    loggerAppName: process.env.VITE_APPLICATION_NAME,
    mongoCollections: []
  });

  const {
    registerRequestQueueHandler,
    sendMessageToResponseQueue
  } = await initRabbitMQConnection();

  registerRequestQueueHandler((msg) => {
    logger.info(`Handler Orchestrator Received request from RabbitMQ:${JSON.stringify(msg)}`);

    for (const { eventName, handler } of handlers) {
      if (eventName === msg.eventName) {
        (async () => {
          const finalResult = await handler({
            payload: msg.payload,
            sendChunk: (chunk) => {
              logger.info(`Sending chunk: ${JSON.stringify({
                requestId: msg.requestId,
                data: chunk,
                isFinal: false
              })}`);
              
              sendMessageToResponseQueue({
                requestId: msg.requestId,
                data: chunk,
                isFinal: false
              })
            }
          });

          sendMessageToResponseQueue({
            requestId: msg.requestId,
            data: finalResult,
            isFinal: true
          })
        })()
      }
    }
  });
}
