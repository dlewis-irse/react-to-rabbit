import { connectRabbitMQ } from '../rabbitmq/connection.js';

(async function startWorker() {
  try {
    console.log('Test Request Handler Starting...');
    const { channel } = await connectRabbitMQ();

    // Create a queue for the worker
    const queue = 'testRequest';
    await channel.assertQueue(queue, { durable: true });

    // Bind the queue to the exchange with the routing key
    const exchange = 'requests';
    const routingKey = 'testRequest';
    await channel.bindQueue(queue, exchange, routingKey);

    console.log(`Worker listening on queue: ${queue}`);

    channel.consume(queue, (msg) => {
      console.log('Received Request');
      const { requestId, payload } = JSON.parse(msg.content.toString());
      console.log('Processing testRequest with payload:', payload);

      // Simulate streaming data
      const sendChunk = (chunk) => {
        channel.publish(
          'responses',
          '',
          Buffer.from(JSON.stringify({ requestId, ...chunk }))
        );
      };

      sendChunk({ data: 'Chunk 1' + Date.now(), isFinal: false });
      sendChunk({ data: 'Chunk 2' + Date.now(), isFinal: false });
      sendChunk({ data: 'Final Chunk' + Date.now(), isFinal: true });

      channel.ack(msg);
    });
  } catch (error) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
})();