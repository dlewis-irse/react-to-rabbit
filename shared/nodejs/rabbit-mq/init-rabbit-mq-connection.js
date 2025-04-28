import amqp from 'amqplib';
import { logger } from '@marketing/web-dev-node-config';

//* *********************************************************
//* Payload Converters
//* *********************************************************
const convertPayloadObjectToBuffer = (payload) => {
  if (typeof payload === 'string') {
    return Buffer.from(payload);
  }
  return Buffer.from(JSON.stringify(payload));
};

const convertMessageToObject = (msg) => {
  try {
    return JSON.parse(msg.content.toString());
  } catch (err) {
    return msg.content.toString();
  }
};

//* *********************************************************
//* Establish Exchange
//* *********************************************************
export const establishExchange = async ({
  connection,
  exchangeName,
  fanout,
  onExchangeMessage
}) => {
  const exchangeChannel = await connection.createChannel();
  if (fanout) {
    await exchangeChannel.assertExchange(exchangeName, 'fanout', {
      durable: false
    });
  }

  const exchangeListenerQueue = await exchangeChannel.assertQueue('', {
    exclusive: true
  });

  exchangeChannel.bindQueue(exchangeListenerQueue.queue, exchangeName);

  exchangeChannel.consume(
    exchangeListenerQueue.queue,
    (msg) => {
      const msgObject = convertMessageToObject(msg);
      try {
        onExchangeMessage(msgObject);
      } catch (err) {
        logger.error(err);
      }
    },
    { noAck: true }
  );

  const postMessageToExchange = (payload = {}) => {
    exchangeChannel.publish(
      exchangeName,
      '',
      convertPayloadObjectToBuffer(payload)
    );
  };

  return postMessageToExchange;
};

//* *********************************************************
//* Init Rabbit MQ Connection
//* *********************************************************
export default async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);

    // Request Exchange
    const requestHandlers = [];
    const sendMessageToRequestQueue = await establishExchange({
      connection,
      exchangeName: process.env.RABBITMQ_REQUEST_EXCHANGE,
      onExchangeMessage: (msg) => {
        for (const handler of requestHandlers) {
          try {
            handler(msg);
          } catch (err) {
            logger.error(err);
          }
        }
      }
    });

    const registerRequestQueueHandler = (handler) => {
      requestHandlers.push(handler);
    };

    // Response Exchange
    const responseHandlers = [];
    const sendMessageToResponseQueue = await establishExchange({
      connection,
      exchangeName: process.env.RABBITMQ_RESPONSE_EXCHANGE,
      fanout: true,
      onExchangeMessage: (msg) => {
        for (const handler of responseHandlers) {
          try {
            handler(msg);
          } catch (err) {
            logger.error(err);
          }
        }
      }
    });

    const registerResponseQueueHandler = (handler) => {
      responseHandlers.push(handler);
    };


    return {
      connection,
      registerRequestQueueHandler,
      registerResponseQueueHandler,
      sendMessageToRequestQueue,
      sendMessageToResponseQueue
    };
  } catch (error) {
    logger.error('RabbitMQ connection failed:', error);
    throw error;
  }
}
