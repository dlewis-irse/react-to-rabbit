import { logger } from '@marketing/web-dev-node-config';
import registerHandlers from '../register-handlers.js';

registerHandlers([
  {
    eventName: 'testRequest',
    handler: async ({ payload, sendChunk }) => {
      logger.info(`Processing testRequest with payload: ${JSON.stringify(payload)}`);

      // Simulate streaming data
      sendChunk('Chunk 1');
      sendChunk('Chunk 2');

      // Return final data
      return 'Final Chunk';
    }
  }
]);
