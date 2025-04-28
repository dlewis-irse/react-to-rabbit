# Project Tracker

## Project Goal Summary

The primary goal is to establish a clean and user-friendly pattern for a React application to trigger backend tasks (potentially long-running) and receive their results asynchronously. This system should abstract away the complexities of a message queue (RabbitMQ) and WebSocket communication (Socket.IO), presenting a request-response-like experience to the React developer. The backend transport layer (NodeJS) should be easily extensible to support various types of requests through a plugin architecture. Worker services processing these requests should be standalone and communicate exclusively through RabbitMQ, ensuring loose coupling between components. The WebSocket server should act as a bridge, relaying requests from the React client to RabbitMQ and responses from RabbitMQ back to the client. The system must support sending and receiving full JSON objects and streaming data.

## Coding Standards

- Use Bun.js instead of Node.js for backend execution.
- Use ES6 import syntax for all resource imports.
- Write code in a reusable pattern whenever possible.
- Avoid using classes; prefer functional programming patterns.

# TODO

## Python Services
- [ ] Create registerHandlers (/shared/nodejs/rabbit-mq/registerHandlers.js) in Python
- [ ] Create a Python Service Handler that uses registerHandlers

## Service Regristration
- [ ] Create a service regristration service that provides a strongly typed way for the client to call services


## Documentation Tasks

- [ ] Update `README.md` with architecture details, including the role of RabbitMQ, WebSocket server, and worker services.
- [ ] Add usage instructions for running the project, including environment variable setup and starting the services.
- [ ] Document the `registerHandler` utility, including its API, parameters, and examples of usage.
- [ ] Document the `makeBackendRequest` API, including its parameters, return values, and examples of usage.
- [ ] Add testing guidelines to the `README.md`, including how to run unit and integration tests and interpret the results.
