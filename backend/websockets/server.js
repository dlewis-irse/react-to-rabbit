import WebSocket from 'ws';
import { connectRabbitMQ } from '../rabbitmq/connection.js';

export async function startServer () {
  try {
    const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

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
          // Handle the request here
          console.log('Received request:', request);
          ws.send(JSON.stringify({ status: 'success', data: request }));
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({ status: 'error', error: error.message }));
        }
      });
    });

    console.log('WebSocket server running on *:8080');
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}
