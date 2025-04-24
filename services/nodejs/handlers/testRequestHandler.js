import registerHandlers from '../../../shared/nodejs/rabbit-mq/registerHandlers.js';

registerHandlers([
  {
    eventName: 'testRequest',
    handler: async ({ payload, sendChunk }) => {
      console.log('Processing testRequest with payload:', payload);

      // Simulate streaming data
      sendChunk({ data: 'Chunk 1' });
      sendChunk({ data: 'Chunk 2' });

      // Return final data
      return { data: 'Final Chunk' };
    }
  }
]);
