import { logger } from '@marketing/web-dev-node-config';
import registerHandlers from '../../../shared/nodejs/rabbit-mq/registerHandlers.js';

registerHandlers([
  {
    eventName: 'testRequest',
    handler: async ({ payload, sendChunk }) => {
      logger.info('Processing testRequest with payload:', payload);

      // Simulate streaming data
      sendChunk('Chunk 1');
      sendChunk('Chunk 2');

      // Return final data
      return 'Final Chunk';
    }
  }
]);
