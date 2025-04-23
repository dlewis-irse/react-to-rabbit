# Task Tracker

## Project Goal Summary:

The primary goal is to establish a clean and user-friendly pattern for a React application to trigger backend tasks (potentially long-running) and receive their results asynchronously. This system should abstract away the complexities of a message queue (RabbitMQ) and WebSocket communication (Socket.IO), presenting a request-response-like experience to the React developer. The backend transport layer (NodeJS) should be easily extensible to support various types of requests through a plugin architecture, and the worker services processing these requests should be implementable in different languages (specifically Python and NodeJS). The system must support sending and receiving full JSON objects and streaming data.

## React Developer Tasks

- [ ] Implement `makeBackendRequest` function to send JSON payloads to the backend.
- [ ] Handle JSON responses and resolve Promises with backend results.
- [ ] Support streaming data with a callback function for progressive updates.
- [ ] Handle errors and reject Promises with error messages.

## Backend Developer Tasks

- [x] Set up WebSocket server to handle connections from React clients.
- [x] Route incoming requests to RabbitMQ based on `requestType`.
- [x] Maintain mapping of request IDs to WebSocket connections.
- [x] Consume responses from RabbitMQ and relay them to WebSocket clients.
- [ ] Implement plugin architecture for request handlers.
- [ ] Update WebSocket server to use ES6 import syntax.
- [ ] Replace Node.js with Bun.js for backend execution.
- [ ] Add support for streaming data in the backend.
- [ ] Write unit tests for all backend components (Test Driven Development).
- [ ] Refactor backend code to follow reusable patterns.

## Worker Service Developer Tasks

- [ ] Implement RabbitMQ consumers for worker services (Python/NodeJS).
- [ ] Publish JSON responses to RabbitMQ with original request IDs.
- [ ] Support streaming data by publishing chunks to RabbitMQ.
- [ ] Write unit tests for worker services (Test Driven Development).
- [ ] Refactor worker service code to follow reusable patterns.

## Testing Tasks

- [ ] Write unit tests for `connectRabbitMQ` to test RabbitMQ connection and error handling.
- [ ] Write unit tests for `startServer` to test WebSocket server functionality and error handling.
- [ ] Write unit tests for environment variable loading.
- [ ] Write unit tests for `rabbitmqConfig` to validate default values.

## Coding Standards

- Use Bun.js instead of Node.js for backend execution.
- Use ES6 import syntax for all resource imports.
- Follow Test Driven Development (TDD) for all implementations.
- Write code in a reusable pattern whenever possible.

## Testing Standards

- Use Jest as the testing framework for all unit tests.
- Prefer dependency injection over mocking for testing components and services.
- Ensure tests are isolated and do not rely on external systems like RabbitMQ or WebSocket servers unless explicitly required.