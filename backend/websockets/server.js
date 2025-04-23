import WebSocket from 'ws';
import { connectRabbitMQ } from '../rabbitmq/connection.js';

export async function startServer() {
  try {
    const wsPort = process.env.VITE_SERVER_PORT || 8080;
    const wss = new WebSocket.Server({ port: wsPort });

    // Connect to RabbitMQ
    const { connection, channel } = await connectRabbitMQ();

    // Create a queue for responses
    const responseQueue = 'websocket_responses';
    await channel.assertQueue(responseQueue, { durable: true });

    // Bind the response queue to the responses exchange
    const responseExchange = 'responses';
    await channel.bindQueue(responseQueue, responseExchange, '');

    wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.on('close', () => {
        console.log('Client disconnected');
      });

      ws.on('message', async (message) => {
        try {
          const request = JSON.parse(message.toString());
          const { requestId, requestType, payload } = request;

          console.log('Publishing request:', request);
          // Publish the request to RabbitMQ
          channel.publish(
            'requests',
            requestType,
            Buffer.from(JSON.stringify({ requestId, payload }))
          );

          // Listen for the response from RabbitMQ
          const consumeResponse = (msg) => {
            const response = JSON.parse(msg.content.toString());
            console.log('Received response from RabbitMQ:', { response, requestId });
            if (response.requestId === requestId) {
              ws.send(JSON.stringify(response));
              channel.ack(msg);
              channel.removeListener('message', consumeResponse);
            }
          };

          channel.consume(responseQueue, consumeResponse, { noAck: false });
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
