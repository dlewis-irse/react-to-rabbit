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

## Functionality Tasks

### React Developer Tasks

- [ ] Test the `makeBackendRequest` function to ensure it handles streaming data and errors correctly.
- [ ] Handle streaming data in the UI by providing real-time feedback to the user.
- [ ] Add error handling in the UI to display meaningful messages when requests fail.
- [ ] (Optional) Set up state management for handling complex state, such as streaming data and error states.

### Backend Developer Tasks

- [x] Add logging for RabbitMQ and WebSocket server events using a logging library.
- [x] Add configuration validation to ensure correct settings at startup, such as RabbitMQ URLs and exchange names.

### Multi-Language Support

- [ ] Add support for creating services in Python.
  - [ ] Implement a Python version of the `registerHandler` utility.
  - [ ] Create a sample Python service to demonstrate functionality.
  - [ ] Ensure compatibility with RabbitMQ and the existing architecture.
- [ ] Add support for creating services in Go.
  - [ ] Implement a Go version of the `registerHandler` utility.
  - [ ] Create a sample Go service to demonstrate functionality.
  - [ ] Ensure compatibility with RabbitMQ and the existing architecture.

### Logging and Observability

- [ ] Implement centralized logging for all components (client, server, RabbitMQ, and processing agents).
  - [ ] Use a logging library (e.g., Winston for Node.js, Loguru for Python, and Logrus for Go).
  - [ ] Ensure logs include timestamps, log levels, and contextual information.
- [ ] Add real-time observability for communication between components.
  - [ ] Implement a dashboard to visualize messages sent and received by the client, server, RabbitMQ, and processing agents.
  - [ ] Use WebSocket or a similar technology to stream logs and events to the dashboard in real time.
  - [ ] Include filters to view specific components or message types.

## Testing Tasks

- [ ] Write unit tests for `makeBackendRequest` to test backend request handling, including streaming and error scenarios.
- [ ] Write unit tests for the `registerHandler` utility to ensure it correctly handles RabbitMQ setup and message processing.
- [ ] Write integration tests to verify the end-to-end flow from the React client to the worker service and back, including streaming data.
- [ ] Write unit tests for the Python version of the `registerHandler` utility.
- [ ] Write unit tests for the Go version of the `registerHandler` utility.
- [ ] Write integration tests to verify multi-language service compatibility with the existing architecture.
- [ ] Write tests for the logging functionality to ensure logs are generated correctly and include all required information.
- [ ] Write tests for the real-time observability dashboard to verify it displays accurate and up-to-date information.

## Documentation Tasks

- [ ] Update `README.md` with architecture details, including the role of RabbitMQ, WebSocket server, and worker services.
- [ ] Add usage instructions for running the project, including environment variable setup and starting the services.
- [ ] Document the `registerHandler` utility, including its API, parameters, and examples of usage.
- [ ] Document the `makeBackendRequest` API, including its parameters, return values, and examples of usage.
- [ ] Add testing guidelines to the `README.md`, including how to run unit and integration tests and interpret the results.
