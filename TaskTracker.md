# Task Tracker

## Project Goal Summary

The primary goal is to establish a clean and user-friendly pattern for a React application to trigger backend tasks (potentially long-running) and receive their results asynchronously. This system should abstract away the complexities of a message queue (RabbitMQ) and WebSocket communication (Socket.IO), presenting a request-response-like experience to the React developer. The backend transport layer (NodeJS) should be easily extensible to support various types of requests through a plugin architecture, and the worker services processing these requests should be implementable in different languages (specifically Python and NodeJS). The system must support sending and receiving full JSON objects and streaming data.

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

## Worker Service Developer Tasks

- [ ] Implement RabbitMQ consumers for worker services (Python/NodeJS).
- [ ] Publish JSON responses to RabbitMQ with original request IDs.
- [ ] Support streaming data by publishing chunks to RabbitMQ.
- [ ] Write unit tests for worker services (Test Driven Development).
- [ ] Refactor worker service code to follow reusable patterns.
- [ ] Implement a RabbitMQ consumer for the worker service to process `testRequest`.
- [ ] Publish a response to RabbitMQ with the original request ID.

## Testing Tasks

- [x] Write unit tests for `connectRabbitMQ` to test RabbitMQ connection and error handling.
- [x] Write unit tests for `startServer` to test WebSocket server functionality and error handling.
- [x] Write unit tests for `websocketClient` to test WebSocket client functionality.
- [ ] Write unit tests for `makeBackendRequest` to test backend request handling.
- [ ] Write unit tests for environment variable loading.
- [ ] Write unit tests for `rabbitmqConfig` to validate default values.
- [ ] Write unit tests for the `testRequest` handler in the backend.
- [ ] Write unit tests for the RabbitMQ consumer in the worker service.

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

## Current State

### Backend
- The WebSocket server is set up and routes requests to appropriate handlers.
- The `testRequest` handler is implemented and simulates streaming data.
- The `routeRequest` function passes the `sendChunk` function to handlers, enabling streaming responses.

### Client
- The client is set up using Vite and includes a testing interface in `App.jsx`.
- The `makeBackendRequest` function is implemented and handles streaming data and final responses.
- The WebSocket client utility is functional and integrated with the backend.

### Issues Resolved
- Fixed the issue where `sendChunk` was undefined in the `testRequest` handler.
- Updated the backend to include `requestId` in responses, ensuring proper client-side handling.
- Resolved the issue where the client was not receiving the final response from the backend.