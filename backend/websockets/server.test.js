import { startServer } from './server.js';
import WebSocket from 'ws';

let server;

beforeAll(async () => {
  server = await startServer();
});

afterAll(() => {
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
