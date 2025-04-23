import { startServer } from './server.js';
import WebSocket from 'ws';
import amqp from 'amqplib';

let server;
let channel;
let connection;

beforeAll(async () => {
  server = await startServer();
  connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();

  // Set up the response queue
  await channel.assertQueue('websocket_responses', { durable: true });
});

afterAll(async () => {
  await channel.close();
  await connection.close();
  server.close();
});

describe('WebSocket Server', () => {
  it('should accept WebSocket connections', (done) => {
    const client = new WebSocket(`ws://localhost:${process.env.PORT || 8080}`);

    client.on('open', () => {
      expect(client.readyState).toBe(WebSocket.OPEN);
      client.close();
      done();
    });

    client.on('error', (err) => {
      done(err);
    });
  });

  it('should handle messages from clients', (done) => {
    const client = new WebSocket(`ws://localhost:${process.env.PORT || 8080}`);

    client.on('open', () => {
      const message = JSON.stringify({ type: 'test', payload: 'Hello, server!' });
      client.send(message);
    });

    server.on('connection', (ws) => {
      ws.on('message', (data) => {
        expect(data.toString()).toBe(JSON.stringify({ type: 'test', payload: 'Hello, server!' }));
        client.close();
        done();
      });
    });

    client.on('error', (err) => {
      done(err);
    });
  });
});

describe('WebSocket Server Integration', () => {
  it('should handle a full request-response flow', (done) => {
    const client = new WebSocket(`ws://localhost:${process.env.VITE_SERVER_PORT || 8080}`);

    client.on('open', () => {
      const requestId = 'testRequest-123';
      const message = JSON.stringify({
        requestId,
        requestType: 'testRequest',
        payload: { key: 'value' },
      });
      client.send(message);
    });

    client.on('message', (data) => {
      const response = JSON.parse(data);
      expect(response.requestId).toBe('testRequest-123');
      expect(response.data).toBeDefined();
      client.close();
      done();
    });

    client.on('error', (err) => {
      done(err);
    });
  });
});
