import createWebSocketClient from './websocketClient';

const serverPort = import.meta.env.VITE_SERVER_PORT || 8080;
const client = createWebSocketClient(`ws://localhost:${serverPort}`);
client.connect();

const loggerService = {
  log: (level, message, meta = {}) => {
    const logEntry = { level, message, meta, timestamp: new Date().toISOString() };
    client.send('client-log', logEntry);
  },

  info: (message, meta) => loggerService.log('info', message, meta),
  error: (message, meta) => loggerService.log('error', message, meta),
  warn: (message, meta) => loggerService.log('warn', message, meta),
  debug: (message, meta) => loggerService.log('debug', message, meta)
};

export default loggerService;
