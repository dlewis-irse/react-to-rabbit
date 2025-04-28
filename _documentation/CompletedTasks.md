# Completed Tasks

## React Developer Tasks

- Set up client using Vite for development and build.
- Set up WebSocket client utility in the React app.
- Implement `makeBackendRequest` function to send JSON payloads to the backend.
- Add a testing interface in `App.jsx` to utilize `makeBackendRequest`.
- Clean up `App.jsx` to remove Vite boilerplate and simplify the UI.

## Backend Developer Tasks

- Set up WebSocket server to handle connections from React clients.
- Route incoming requests to RabbitMQ based on `requestType`.
- Maintain mapping of request IDs to WebSocket connections.
- Consume responses from RabbitMQ and relay them to WebSocket clients.
- Update WebSocket server to use ES6 import syntax.
- Implement plugin architecture for request handlers.
- Replace Node.js with Bun.js for backend execution.
- Implement error handling for RabbitMQ disconnections.
- Add support for streaming data in the backend.

## Worker Service Developer Tasks

- Implement RabbitMQ consumers for worker services (NodeJS).
- Publish JSON responses to RabbitMQ with original request IDs.
- Support streaming data by publishing chunks to RabbitMQ.
- Refactor worker service code to follow reusable patterns.
- Implement a `registerHandler` utility to abstract RabbitMQ setup and message handling.
- Refactor `testRequestHandler.js` to use the `registerHandler` utility.
- Ensure the refactored `testRequestHandler` aligns with the desired structure.

## Testing Tasks

- Write unit tests for `connectRabbitMQ` to test RabbitMQ connection and error handling.
- Write unit tests for `startServer` to test WebSocket server functionality and error handling.
- Write unit tests for `websocketClient` to test WebSocket client functionality.

## Design Flaw Identified

### Tasks to Address the Design Flaw

#### Backend Developer Tasks
- Refactor the WebSocket server to publish requests to RabbitMQ instead of directly invoking handlers.
- Update the WebSocket server to listen for responses from RabbitMQ and relay them to the React client.
- Remove direct coupling between the WebSocket server and `testRequestHandler.js`.

#### Worker Service Developer Tasks
- Implement a standalone worker service for `testRequestHandler.js` that listens for messages from RabbitMQ.
- Ensure the worker service processes the request and publishes the response back to RabbitMQ with the original request ID.
- Support streaming data by publishing chunks to RabbitMQ.

#### Testing Tasks
- Write integration tests to verify the end-to-end flow from the React client to the worker service and back.
- Write unit tests for the RabbitMQ consumer in the worker service.
- Write unit tests for the RabbitMQ publisher in the WebSocket server.