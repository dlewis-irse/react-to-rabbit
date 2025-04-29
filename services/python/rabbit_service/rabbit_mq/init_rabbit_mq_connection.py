"""
RabbitMQ connection initialization and exchange setup
"""
import json
import logging
import os
from typing import Any, Awaitable, Callable, Dict, List

import aio_pika
from aio_pika.abc import AbstractChannel, AbstractConnection
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# *********************************************************
# * Payload Converters
# *********************************************************
def convert_payload_to_bytes(payload: Any) -> bytes:
    """Convert payload to bytes for sending to RabbitMQ."""
    if isinstance(payload, str):
        return payload.encode()
    return json.dumps(payload).encode()

def convert_message_to_object(message: aio_pika.IncomingMessage) -> Any:
    """Convert RabbitMQ message to Python object."""
    try:
        return json.loads(message.body.decode())
    except:
        return message.body.decode()

# *********************************************************
# * Establish Exchange
# *********************************************************
async def establish_exchange(
    connection: AbstractConnection,
    exchange_name: str,
    fanout: bool = False,
    on_exchange_message: Callable = None
) -> Callable:
    """
    Establish an exchange and return function to post messages.
    
    Args:
        connection: RabbitMQ connection
        exchange_name: Name of the exchange
        fanout: Whether this is a fanout exchange
        on_exchange_message: Callback for received messages
    
    Returns:
        Function to post messages to the exchange
    """
    exchange_channel = await connection.channel()
    
    # Create the exchange
    if fanout:
        exchange = await exchange_channel.declare_exchange(
            exchange_name,
            type=aio_pika.ExchangeType.FANOUT,
            durable=False
        )
    else:
        exchange = await exchange_channel.declare_exchange(
            exchange_name,
            type=aio_pika.ExchangeType.DIRECT,
            durable=False
        )
    
    # Create an exclusive queue for this exchange
    exchange_listener_queue = await exchange_channel.declare_queue(
        "",  # Empty name for auto-generated queue name
        exclusive=True
    )
    
    # Bind the queue to the exchange
    await exchange_listener_queue.bind(exchange)

    if on_exchange_message:
        async def process_message(message: aio_pika.IncomingMessage):
            async with message.process(requeue=False):
                try:
                    msg_object = convert_message_to_object(message)
                    for handler in on_exchange_message:
                        try:
                            await handler(msg_object)
                        except Exception as e:
                            logger.error(f"Error in exchange message handler: {str(e)}")
                except Exception as e:
                    logger.error(f"Error processing exchange message: {str(e)}")

        await exchange_listener_queue.consume(process_message)

    async def post_message_to_exchange(payload: Any = {}):
        """Post a message to the exchange."""
        await exchange.publish(
            aio_pika.Message(
                body=convert_payload_to_bytes(payload),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=""  # Empty routing key as per spec
        )
    
    return post_message_to_exchange

# *********************************************************
# * Init Rabbit MQ Connection
# *********************************************************
async def init_rabbit_mq_connection():
    """Initialize RabbitMQ connection and return handler registration functions."""
    try:
        # Load environment variables
        load_dotenv()
        
        # Connect to RabbitMQ
        connection = await aio_pika.connect_robust(
            os.getenv("RABBITMQ_URL", "amqp://esri_admin:esri_password@localhost/")
        )

        # Request Exchange
        request_handlers = []
        send_message_to_request_queue = await establish_exchange(
            connection,
            os.getenv("RABBITMQ_REQUEST_EXCHANGE", "requests"),
            on_exchange_message=request_handlers
        )

        def register_request_queue_handler(handler: Callable):
            """Register a handler for request messages."""
            request_handlers.append(handler)
            logger.info("Request handler registered")

        # Response Exchange
        response_handlers = []
        send_message_to_response_queue = await establish_exchange(
            connection,
            os.getenv("RABBITMQ_RESPONSE_EXCHANGE", "responses"),
            fanout=True,
            on_exchange_message=response_handlers
        )

        def register_response_queue_handler(handler: Callable):
            """Register a handler for response messages."""
            response_handlers.append(handler)
            logger.info("Response handler registered")

        return {
            "connection": connection,
            "register_request_queue_handler": register_request_queue_handler,
            "register_response_queue_handler": register_response_queue_handler,
            "send_message_to_request_queue": send_message_to_request_queue,
            "send_message_to_response_queue": send_message_to_response_queue
        }

    except Exception as error:
        logger.error(f"Failed to initialize RabbitMQ connection: {str(error)}")
        raise 