# Register Handlers Specification

## Overview
The `registerHandlers.js` module provides a mechanism to register event handlers for RabbitMQ messages. It sets up the necessary exchanges, queues, and bindings to enable communication between services.

## Architecture

### Exchanges
1. **Requests Exchange**
   - Type: `direct`
   - Name: `requests`
   - Purpose: Receives incoming requests from clients
   - Durability: `true`

2. **Responses Exchange**
   - Type: `direct`
   - Name: `responses`
   - Purpose: Sends responses back to clients
   - Durability: `true`

### Queues
1. **Event-Specific Queues**
   - Created for each registered event handler
   - Named after the event (e.g., `testRequest`)
   - Durability: `true`
   - Binding: Bound to `requests` exchange with event name as routing key

2. **WebSocket Responses Queue**
   - Name: `websocket_responses`
   - Durability: `true`
   - Binding: Bound to `responses` exchange with empty routing key

## Message Flow

### Request Flow
1. Client sends request to `requests` exchange
2. Request is routed to appropriate queue based on event name
3. Handler processes request and sends responses

### Response Flow
1. Handler sends response to `responses` exchange
2. Response is routed to `websocket_responses` queue
3. WebSocket server consumes from `websocket_responses` queue

## Handler Registration

### Handler Structure
```javascript
{
  eventName: string,  // Name of the event to handle
  handler: async ({ payload, sendChunk }) => {
    // Process the request
    // Send chunks using sendChunk
    // Return final data
  }
}
```

### Handler Parameters
- `payload`: The request payload
- `sendChunk`: Function to send streaming data chunks

### Response Format
```javascript
{
  requestId: string,  // ID of the original request
  data: any,         // Response data
  isFinal: boolean   // Whether this is the final response
}
```

## Error Handling
- Errors are caught and sent as error responses
- Error responses include:
  - `requestId`: ID of the original request
  - `error`: Error message
  - `isFinal: true`

## Message Acknowledgment
- Messages are acknowledged after processing
- Ensures reliable message delivery

## Connection Management
- Uses robust connection handling
- Reconnects automatically on connection loss
- Maintains channel and queue bindings

## Example Usage
```javascript
registerHandlers([
  {
    eventName: 'testRequest',
    handler: async ({ payload, sendChunk }) => {
      // Send streaming data
      sendChunk('Chunk 1');
      sendChunk('Chunk 2');
      
      // Return final data
      return 'Final Chunk';
    }
  }
]);
```

## Key Points
1. Uses direct exchanges for both requests and responses
2. Maintains separate queues for each event type
3. Uses a dedicated queue for WebSocket responses
4. Supports streaming data through chunked responses
5. Handles errors gracefully
6. Ensures message delivery through acknowledgments
7. Maintains robust connections 