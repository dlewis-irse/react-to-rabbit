# Architecture Overview

## System Components

### Client Application
- React-based frontend application
- Uses WebSocket for real-time communication
- Implements a clean request-response pattern through `makeBackendRequest` utility
- Handles asynchronous responses and streaming data

### Backend Services
- **Socket.IO Server**: Acts as a bridge between client and message queue
  - Handles WebSocket connections
  - Routes requests to RabbitMQ
  - Manages response delivery to clients
- **Worker Services**: Standalone services that process requests
  - Communicate exclusively through RabbitMQ
  - Implement plugin architecture for extensibility
  - Process requests asynchronously

### Message Queue (RabbitMQ)
- Central message broker for the system
- Handles request routing and response delivery
- Ensures loose coupling between components
- Supports full JSON object transmission and streaming data

## Communication Flow

### Client to Backend
1. Client initiates request using `makeBackendRequest`
2. Request is sent through WebSocket connection
3. Socket.IO server receives request and publishes to RabbitMQ
4. Worker service processes request and publishes response
5. Response is routed back to client through WebSocket

### Backend to Worker Services
1. Requests are published to RabbitMQ exchange
2. Worker services consume requests based on routing keys
3. Processing results are published back to response queue
4. Socket.IO server delivers responses to appropriate clients

## Key Components

### Client-Side
- `websocketClient.js`: Manages WebSocket connection
- `makeBackendRequest.js`: Provides request-response interface
- `loggerService.js`: Handles client-side logging

### Backend
- `socket-io-server.js`: WebSocket server implementation
- `backend/index.js`: Main backend service
- `shared/nodejs/rabbit-mq/`: RabbitMQ utilities
  - `connection.js`: RabbitMQ connection management
  - `registerHandlers.js`: Service handler registration

### Worker Services
- Standalone services that implement specific business logic
- Use `registerHandlers.js` for request processing
- Communicate through RabbitMQ queues

## Development Standards

- Use Bun.js for backend execution
- Follow ES6 import syntax
- Implement functional programming patterns
- Maintain loose coupling between components
- Support extensibility through plugin architecture

## Data Flow

1. **Request Initiation**
   - Client creates request with unique ID
   - Request includes type and payload
   - WebSocket connection established if needed

2. **Request Processing**
   - Socket.IO server receives request
   - Request published to RabbitMQ
   - Worker service processes request
   - Response generated and published

3. **Response Delivery**
   - Response routed through RabbitMQ
   - Socket.IO server delivers to client
   - Client handles response through callback

## Error Handling

- WebSocket connection management
- RabbitMQ connection recovery
- Request timeout handling
- Error propagation to clients
- Logging and monitoring

## Security Considerations

- WebSocket connection security
- RabbitMQ access control
- Request validation
- Response sanitization
- Error message handling