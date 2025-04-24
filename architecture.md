# Architecture Overview

## Client Communication with the Backend

### WebSocket Communication
- The client uses a WebSocket connection to communicate with the backend. This is implemented in the `websocketClient.js` utility.
- The `websocketClient` establishes a persistent WebSocket connection to the backend server and provides methods to send messages and handle responses.

### Backend Requests
- The `makeBackendRequest.js` utility is used to send requests from the client to the backend.
- It generates a unique `requestId` for each request and sends it through the WebSocket connection along with the `requestType` and `payload`.
- The backend processes the request and sends responses back to the client, which are handled by the `onMessage` callback in the `websocketClient`.

### Client Logging
- The `loggerService.js` utility sends client-side logs to the backend using the `websocketClient`. Logs are sent as `client-log` events, which are processed by the backend's Socket.IO server.

---

## Backend Communication with RabbitMQ

### WebSocket Server
- The backend WebSocket server listens for messages from the client.
- When a message is received, it is parsed to extract the `requestId`, `requestType`, and `payload`.
- The backend publishes the request to RabbitMQ's `requests` exchange using the `requestType` as the routing key.

### RabbitMQ Integration
- The RabbitMQ connection is managed by the `connection.js` file in the `shared/nodejs/rabbit-mq` directory.
- The backend publishes messages to the `requests` exchange and listens for responses on the `responses` exchange.

### Response Handling
- The backend consumes messages from the `responses` queue in RabbitMQ.
- When a response is received, it is matched with the original `requestId` and sent back to the client through the WebSocket connection.

---

## Worker Services

### Handler Registration
- Worker services use the `registerHandlers.js` utility to register event handlers for specific `requestType` events.
- Each handler processes messages from RabbitMQ and sends responses back to the `responses` exchange.

### Example Handler
- The `testRequestHandler.js` file demonstrates how a worker service processes a `testRequest` event.
- It sends intermediate chunks of data using the `sendChunk` function and a final response when processing is complete.

---

## Summary of Flow

### Client
- Sends a request via WebSocket using `makeBackendRequest`.
- Logs events using `loggerService`.

### Backend
- Receives the request via WebSocket.
- Publishes the request to RabbitMQ's `requests` exchange.
- Listens for responses on the `responses` queue and sends them back to the client.

### Worker Services
- Consume messages from RabbitMQ's `requests` exchange.
- Process the request and publish responses to the `responses` exchange.

This architecture ensures asynchronous communication between the client, backend, and worker services, with RabbitMQ acting as the message broker.