import { startServer } from './websockets/server.js';


const requestHandlers = {}; // Updated to an empty object as handlers are now standalone services

export function routeRequest(requestType, payload, sendChunk) {
  const handler = requestHandlers[requestType];
  if (!handler) {
    throw new Error(`No handler found for request type: ${requestType}`);
  }
  return handler(payload, sendChunk);
}

startServer();
