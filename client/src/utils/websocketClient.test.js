import createWebSocketClient from './websocketClient';

let mockWebSocket;

beforeEach(() => {
  mockWebSocket = {
    send: jest.fn(),
    close: jest.fn(),
    readyState: WebSocket.OPEN,
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
  };

  global.WebSocket = jest.fn(() => mockWebSocket);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('WebSocketClient', () => {
  it('should establish a WebSocket connection', () => {
    const client = createWebSocketClient('ws://localhost:8080');
    client.connect();

    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
    expect(mockWebSocket.onopen).toBeDefined();
  });

  it('should send a message when WebSocket is open', () => {
    const client = createWebSocketClient('ws://localhost:8080');
    client.connect();
    client.send('123', { type: 'test', payload: 'data' });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ requestId: '123', type: 'test', payload: 'data' })
    );
  });

  it('should not send a message when WebSocket is not open', () => {
    mockWebSocket.readyState = WebSocket.CLOSED;

    const client = createWebSocketClient('ws://localhost:8080');
    client.connect();
    client.send('123', { type: 'test', payload: 'data' });

    expect(mockWebSocket.send).not.toHaveBeenCalled();
  });

  it('should handle incoming messages', () => {
    const client = createWebSocketClient('ws://localhost:8080');
    client.connect();

    const mockHandler = jest.fn();
    client.onMessage('123', mockHandler);

    const messageEvent = {
      data: JSON.stringify({ requestId: '123', data: 'response data' })
    };

    mockWebSocket.onmessage(messageEvent);

    expect(mockHandler).toHaveBeenCalledWith('response data');
  });

  it('should reconnect when WebSocket is closed', () => {
    jest.useFakeTimers();

    const client = createWebSocketClient('ws://localhost:8080');
    client.connect();

    mockWebSocket.onclose();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);

    jest.runAllTimers();

    expect(global.WebSocket).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});