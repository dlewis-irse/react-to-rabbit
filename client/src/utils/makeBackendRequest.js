import createWebSocketClient from './websocketClient';

const client = createWebSocketClient('ws://localhost:8080');
client.connect();

export function makeBackendRequest(requestType, payload, onStreamChunk) {
  return new Promise((resolve, reject) => {
    const requestId = `${requestType}-${Date.now()}`;

    // Handle streaming data if a callback is provided
    if (onStreamChunk) {
      client.onMessage(requestId, (chunk) => {
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
        resolve(response);
      });
    }

    // Send the request to the backend
    try {
      client.send(requestId, { requestType, payload });
    } catch (error) {
      client.removeMessageHandler(requestId);
      reject(error);
    }
  });
}