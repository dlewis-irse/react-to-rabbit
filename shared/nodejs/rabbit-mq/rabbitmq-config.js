const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: 'requests',
  responseExchange: 'responses',
  queue: 'backend_queue'
};

export default rabbitmqConfig;
