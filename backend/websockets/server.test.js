import { startServer } from './server.js';
import WebSocket from 'ws';

jest.mock('ws');

let mockServer;

beforeEach(() => {
  mockServer = {
    on: jest.fn(),
    close: jest.fn()
  };
  WebSocket.Server.mockImplementation(() => mockServer);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('startServer', () => {
  it('should start a WebSocket server on the specified port', async () => {
    process.env.PORT = '8080';
    await startServer();
    expect(WebSocket.Server).toHaveBeenCalledWith({ port: 8080 });
  });

  it('should handle WebSocket connections', async () => {
    const mockConnectionHandler = jest.fn();
    mockServer.on.mockImplementation((event, handler) => {
      if (event === 'connection') {
        mockConnectionHandler.mockImplementation(handler);
      }
    });

    await startServer();
    expect(mockServer.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('should log when a client connects and disconnects', async () => {
    const mockWs = {
      on: jest.fn()
    };

    mockServer.on.mockImplementation((event, handler) => {
      if (event === 'connection') {
        handler(mockWs);
      }
    });

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await startServer();

    expect(consoleLogSpy).toHaveBeenCalledWith('Client connected');

    const disconnectHandler = mockWs.on.mock.calls.find(([event]) => event === 'close')[1];
    disconnectHandler();

    expect(consoleLogSpy).toHaveBeenCalledWith('Client disconnected');

    consoleLogSpy.mockRestore();
  });

  it('should handle incoming messages and send responses', async () => {
    const mockWs = {
      on: jest.fn(),
      send: jest.fn()
    };

    mockServer.on.mockImplementation((event, handler) => {
      if (event === 'connection') {
        handler(mockWs);
      }
    });

    await startServer();

    const messageHandler = mockWs.on.mock.calls.find(([event]) => event === 'message')[1];
    const mockMessage = JSON.stringify({ test: 'data' });

    messageHandler(mockMessage);

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ status: 'success', data: { test: 'data' } })
    );
  });

  it('should handle errors in message processing', async () => {
    const mockWs = {
      on: jest.fn(),
      send: jest.fn()
    };

    mockServer.on.mockImplementation((event, handler) => {
      if (event === 'connection') {
        handler(mockWs);
      }
    });

    await startServer();

    const messageHandler = mockWs.on.mock.calls.find(([event]) => event === 'message')[1];
    const invalidMessage = 'invalid json';

    messageHandler(invalidMessage);

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ status: 'error', error: expect.any(String) })
    );
  });
});
