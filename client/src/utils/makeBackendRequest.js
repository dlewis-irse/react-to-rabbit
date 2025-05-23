import createWebSocketClient from './websocketClient';
import logger from './loggerService.js';

const serverPort = import.meta.env.VITE_SERVER_PORT || 8080;
const client = createWebSocketClient(`ws://localhost:${serverPort}`);
client.connect();

export function makeBackendRequest (eventName, payload, onStreamChunk) {
  return new Promise((resolve, reject) => {
    const requestId = `${eventName}-${Date.now()}`;

    // Handle streaming data if a callback is provided
    if (onStreamChunk) {
      client.onMessage(requestId, (chunk) => {
        logger.info('client.onMessage', chunk);
        if (chunk.isFinal) {
          client.removeMessageHandler(requestId);
          resolve(chunk.data);
        } else {
          onStreamChunk(chunk.data);
        }
      });
    } else {
      client.onMessage(requestId, (response) => {
        client.removeMessageHandler(requestId);
        resolve(response.data);
      });
    }

    // Send the request to the backend
    try {
      client.send(requestId, { eventName, payload });
    } catch (error) {
      client.removeMessageHandler(requestId);
      reject(error);
    }
  });
}
