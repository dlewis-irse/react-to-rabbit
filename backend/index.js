import { startServer } from './websockets/server.js';
import { handleTestRequest } from './handlers/testRequestHandler.js';

const requestHandlers = {
  testRequest: handleTestRequest,
};

export function routeRequest(requestType, payload, sendChunk) {
  const handler = requestHandlers[requestType];
  if (!handler) {
    throw new Error(`No handler found for request type: ${requestType}`);
  }
  return handler(payload, sendChunk);
}

startServer();
