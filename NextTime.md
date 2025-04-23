# Next Session Prompt

## Project Overview

This project is a React-to-RabbitMQ system designed to facilitate asynchronous communication between a React client and backend services via RabbitMQ. The system supports streaming data and is built with extensibility in mind, allowing for the addition of services in multiple languages (Node.js, Python, Go). The WebSocket server acts as a bridge between the React client and RabbitMQ, while worker services process requests and send responses back through RabbitMQ.

## Progress So Far

### Completed Tasks

- **React Client**:
  - Set up the client using Vite.
  - Implemented a WebSocket client utility.
  - Created the `makeBackendRequest` function to handle backend communication.
  - Added a testing interface in `App.jsx`.
  - Simplified the UI by removing boilerplate.

- **Backend**:
  - Set up a WebSocket server to handle client connections.
  - Implemented RabbitMQ integration for request routing and response handling.
  - Refactored the WebSocket server to decouple it from specific handlers.
  - Added support for streaming data.

- **Worker Services**:
  - Created a `registerHandler` utility to abstract RabbitMQ setup.
  - Refactored `testRequestHandler.js` to use `registerHandler`.
  - Ensured compatibility with RabbitMQ and the WebSocket server.

- **Testing**:
  - Added unit tests for `connectRabbitMQ`, `startServer`, and `websocketClient`.
  - Wrote integration tests for the WebSocket server and RabbitMQ communication.

- **Documentation**:
  - Updated the `ProjectTracker.md` to reflect completed and pending tasks.
  - Moved completed tasks to `CompletedTasks.md`.

## Current Roadmap

### Functionality Tasks

1. **React Client**:
   - Test the `makeBackendRequest` function for streaming and error handling.
   - Enhance the UI to handle streaming data and display real-time feedback.
   - Add error handling to display meaningful messages.
   - (Optional) Implement state management for complex scenarios.

2. **Backend**:
   - Add centralized logging for RabbitMQ and WebSocket server events.
   - Validate configuration settings at startup.

3. **Multi-Language Support**:
   - Add support for Python and Go services by implementing `registerHandler` utilities for each language.
   - Create sample services in Python and Go to demonstrate functionality.

4. **Logging and Observability**:
   - Implement centralized logging for all components (client, server, RabbitMQ, and worker services).
   - Add a real-time observability dashboard to monitor communication between components.

### Testing Tasks

- Write unit tests for `makeBackendRequest` and `registerHandler`.
- Add integration tests for multi-language service compatibility.
- Test the logging and observability features.

### Documentation Tasks

- Update the `README.md` with architecture details and usage instructions.
- Document the `registerHandler` and `makeBackendRequest` utilities.
- Add testing guidelines to the `README.md`.

## Codebase Overview

### React Client
- **`src/utils/makeBackendRequest.js`**: Handles communication with the backend, including streaming data.
- **`src/utils/websocketClient.js`**: WebSocket client utility for managing connections and messages.
- **`src/App.jsx`**: Main UI component with a testing interface for backend requests.

### Backend
- **`backend/websockets/server.js`**: WebSocket server that bridges the React client and RabbitMQ.
- **`backend/rabbitmq/connection.js`**: Manages RabbitMQ connections and exchanges.

### Worker Services
- **`services/nodejs/lib/registerHandler.js`**: Utility to abstract RabbitMQ setup for worker services.
- **`services/nodejs/handlers/testRequestHandler.js`**: Example worker service using `registerHandler`.

### Testing
- Unit tests are located alongside their respective modules (e.g., `websocketClient.test.js`, `connection.test.js`).
- Integration tests verify end-to-end communication between the client, server, and worker services.

## Next Steps

1. Prioritize functionality tasks, starting with testing and enhancing the React client.
2. Begin implementing multi-language support for Python and Go services.
3. Develop centralized logging and a real-time observability dashboard.
4. Write comprehensive tests for new features and update documentation.

This prompt should provide the next assistant with all the context needed to continue the project effectively.