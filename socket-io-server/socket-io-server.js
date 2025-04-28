import WebSocket from 'ws';
import { applicationInitializer } from '@marketing/web-dev-node-config';
import initRabbitMQConnection from '../shared/nodejs/rabbit-mq/init-rabbit-mq-connection.js';

const { logger } = await applicationInitializer.init({
  localConfigPath: './credentials.json',
  secretKey: process.env.SECRET_KEY,
  secretRegion: 'us-west-2',
  mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
  loggerAppName: process.env.VITE_APPLICATION_NAME,
  mongoCollections: []
});

const wsPort = process.env.VITE_SERVER_PORT || 8080;
const wss = new WebSocket.Server({ port: wsPort });

const {
  registerResponseQueueHandler,
  sendMessageToRequestQueue,
} = await initRabbitMQConnection();

let pendingRequests = [];

wss.on('connection', (ws) => {
  logger.info('Client connected');

  ws.on('close', () => {
    logger.info('Client disconnected');
  });

  ws.on('message', async (message) => {
    const request = JSON.parse(message.toString());
    const requestId = request.requestId;

    if (requestId === 'client-log') {
      logger[request.level](request.message);
      return;
    }

    logger.info(`Sending request to RabbitMQ:${JSON.stringify(request)}`);
    pendingRequests.push({ requestId, request, ws });
    sendMessageToRequestQueue(request);
  });
});

registerResponseQueueHandler((response) => {
  const requestHandler = pendingRequests.find(({ requestId }) => requestId === requestId);

  if (requestHandler) {
    requestHandler.ws.send(JSON.stringify(response));
    if(response.isFinal){
      pendingRequests = pendingRequests.filter(({ requestId }) => requestId !== requestId);
    }
  }
});
