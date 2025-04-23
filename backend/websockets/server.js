import WebSocket from 'ws';
import { connectRabbitMQ } from '../rabbitmq/connection.js';
import { routeRequest } from '../index.js';

export async function startServer() {
  try {
    const wsPort = process.env.VITE_SERVER_PORT || 8080;
    const wss = new WebSocket.Server({ port: wsPort });

    // Connect to RabbitMQ
    const { connection, channel } = await connectRabbitMQ();

    wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.on('close', () => {
        console.log('Client disconnected');
      });

      ws.on('message', async (message) => {
        try {
          const request = JSON.parse(message.toString());
          const { requestType, payload } = request;
          const sendChunk = (chunk) => {
            ws.send(JSON.stringify({ requestId: request.requestId, chunk }));
          };
          await routeRequest(requestType, payload, sendChunk);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({ status: 'error', error: error.message }));
        }
      });
    });

    console.log('WebSocket server running on *:' + wsPort);
    return wss;
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}
