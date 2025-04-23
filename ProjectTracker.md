# Project Tracker

## Project Goal Summary

The primary goal is to establish a clean and user-friendly pattern for a React application to trigger backend tasks (potentially long-running) and receive their results asynchronously. This system should abstract away the complexities of a message queue (RabbitMQ) and WebSocket communication (Socket.IO), presenting a request-response-like experience to the React developer. The backend transport layer (NodeJS) should be easily extensible to support various types of requests through a plugin architecture. Worker services processing these requests should be standalone and communicate exclusively through RabbitMQ, ensuring loose coupling between components. The WebSocket server should act as a bridge, relaying requests from the React client to RabbitMQ and responses from RabbitMQ back to the client. The system must support sending and receiving full JSON objects and streaming data.

## Coding Standards

- Use Bun.js instead of Node.js for backend execution.
- Use ES6 import syntax for all resource imports.
- Follow Test Driven Development (TDD) for all implementations.
- Write code in a reusable pattern whenever possible.
- Avoid using classes; prefer functional programming patterns.

## Testing Standards

- Use Jest as the testing framework for all unit tests.
- Prefer dependency injection over mocking for testing components and services.
- Ensure tests are isolated and do not rely on external systems like RabbitMQ or WebSocket servers unless explicitly required.

# TODO

## React Developer Tasks

- [x] Set up client using Vite for development and build.
- [x] Set up WebSocket client utility in the React app.
- [x] Implement `makeBackendRequest` function to send JSON payloads to the backend.
- [x] Add a testing interface in `App.jsx` to utilize `makeBackendRequest`.
- [x] Clean up `App.jsx` to remove Vite boilerplate and simplify the UI.
- [ ] Test the `makeBackendRequest` function.
- [ ] Document the `makeBackendRequest` API.
- [ ] Handle streaming data in the UI.
- [ ] Add error handling in the UI.
- [ ] (Optional) Set up state management for handling complex state.

## Backend Developer Tasks

- [x] Set up WebSocket server to handle connections from React clients.
- [x] Route incoming requests to RabbitMQ based on `requestType`.
- [x] Maintain mapping of request IDs to WebSocket connections.
- [x] Consume responses from RabbitMQ and relay them to WebSocket clients.
- [x] Update WebSocket server to use ES6 import syntax.
- [x] Implement plugin architecture for request handlers.
- [x] Replace Node.js with Bun.js for backend execution.
- [x] Implement error handling for RabbitMQ disconnections.
- [ ] Add support for streaming data in the backend.
- [ ] Add logging for RabbitMQ and WebSocket server events.
- [ ] Document the WebSocket server and RabbitMQ connection setup.
- [ ] Add configuration validation to ensure correct settings at startup.
- [ ] Implement a handler for `testRequest` in the backend.
- [ ] Route the `testRequest` to the appropriate handler in the backend.
- [ ] Refactor the WebSocket server to publish requests to RabbitMQ instead of directly invoking handlers.
- [ ] Update the WebSocket server to listen for responses from RabbitMQ and relay them to the React client.
- [ ] Remove direct coupling between the WebSocket server and `testRequestHandler.js`.

## Worker Service Developer Tasks

- [ ] Implement RabbitMQ consumers for worker services (Python/NodeJS).
- [ ] Publish JSON responses to RabbitMQ with original request IDs.
- [ ] Support streaming data by publishing chunks to RabbitMQ.
- [ ] Write unit tests for worker services (Test Driven Development).
- [ ] Refactor worker service code to follow reusable patterns.
- [ ] Implement a RabbitMQ consumer for the worker service to process `testRequest`.
- [ ] Publish a response to RabbitMQ with the original request ID.
- [ ] Implement a standalone worker service for `testRequestHandler.js` that listens for messages from RabbitMQ.
- [ ] Ensure the worker service processes the request and publishes the response back to RabbitMQ with the original request ID.
- [ ] Support streaming data by publishing chunks to RabbitMQ.

## Testing Tasks

- [x] Write unit tests for `connectRabbitMQ` to test RabbitMQ connection and error handling.
- [x] Write unit tests for `startServer` to test WebSocket server functionality and error handling.
- [x] Write unit tests for `websocketClient` to test WebSocket client functionality.
- [ ] Write unit tests for `makeBackendRequest` to test backend request handling.
- [ ] Write unit tests for environment variable loading.
- [ ] Write unit tests for `rabbitmqConfig` to validate default values.
- [ ] Write unit tests for the `testRequest` handler in the backend.
- [ ] Write unit tests for the RabbitMQ consumer in the worker service.
- [ ] Write integration tests to verify the end-to-end flow from the React client to the worker service and back.
- [ ] Write unit tests for the RabbitMQ publisher in the WebSocket server.

# Design Flaw Identified

### Current Issue
The `testRequestHandler.js` is tightly coupled to the WebSocket server, which violates the intended architecture. Handlers should not be directly invoked by the WebSocket server. Instead, they should operate as standalone services that listen for messages broadcast through RabbitMQ. Responses should be sent back through RabbitMQ to the WebSocket server, which will then transmit them to the React client.

### Tasks to Address the Design Flaw

#### Backend Developer Tasks
- [ ] Refactor the WebSocket server to publish requests to RabbitMQ instead of directly invoking handlers.
- [ ] Update the WebSocket server to listen for responses from RabbitMQ and relay them to the React client.
- [ ] Remove direct coupling between the WebSocket server and `testRequestHandler.js`.

#### Worker Service Developer Tasks
- [ ] Implement a standalone worker service for `testRequestHandler.js` that listens for messages from RabbitMQ.
- [ ] Ensure the worker service processes the request and publishes the response back to RabbitMQ with the original request ID.
- [ ] Support streaming data by publishing chunks to RabbitMQ.

#### Testing Tasks
- [ ] Write integration tests to verify the end-to-end flow from the React client to the worker service and back.
- [ ] Write unit tests for the RabbitMQ consumer in the worker service.
- [ ] Write unit tests for the RabbitMQ publisher in the WebSocket server.



