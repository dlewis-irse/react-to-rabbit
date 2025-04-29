"""
RabbitMQ connection and handler registration
"""
import asyncio
import json
import logging
import os
from typing import Any, Awaitable, Callable, Dict, List

import aio_pika
from aio_pika.abc import AbstractChannel, AbstractConnection
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

async def establish_exchange(
    connection: AbstractConnection,
    exchange_name: str,
    is_fanout: bool = False
) -> tuple[Callable, AbstractChannel]:
    """
    Establish an exchange and return functions to interact with it.
    
    Args:
        connection: RabbitMQ connection
        exchange_name: Name of the exchange
        is_fanout: Whether this is a fanout exchange
    
    Returns:
        Tuple of (publish_function, channel)
    """
    channel = await connection.channel()
    
    # Create the exchange
    exchange = await channel.declare_exchange(
        exchange_name,
        type="fanout" if is_fanout else "direct",
        durable=False if is_fanout else True
    )
    
    # Create an exclusive queue for this exchange
    queue = await channel.declare_queue(
        "",  # Empty name for auto-generated queue name
        exclusive=True
    )
    
    # Bind the queue to the exchange
    await queue.bind(exchange)
    
    async def publish_message(payload: Dict[str, Any]):
        """Publish a message to the exchange."""
        message_body = json.dumps(payload).encode()
        await exchange.publish(
            aio_pika.Message(body=message_body),
            routing_key=""  # Empty routing key for fanout exchanges
        )
    
    return publish_message, channel

async def init_rabbit_mq_connection():
    """Initialize RabbitMQ connection and return handler registration functions."""
    # Load environment variables
    load_dotenv()
    
    try:
        # Connect to RabbitMQ
        connection = await aio_pika.connect_robust(
            os.getenv("RABBITMQ_URL", "amqp://esri_admin:esri_password@localhost/")
        )

        # Set up request exchange
        request_handlers = []
        send_message_to_request_queue, request_channel = await establish_exchange(
            connection,
            os.getenv("RABBITMQ_REQUEST_EXCHANGE", "requests")
        )

        def register_request_queue_handler(handler: Callable):
            """Register a handler for request messages."""
            request_handlers.append(handler)
            logger.info("Request handler registered")

        # Set up response exchange (fanout)
        response_handlers = []
        send_message_to_response_queue, response_channel = await establish_exchange(
            connection,
            os.getenv("RABBITMQ_RESPONSE_EXCHANGE", "responses"),
            is_fanout=True
        )

        def register_response_queue_handler(handler: Callable):
            """Register a handler for response messages."""
            response_handlers.append(handler)
            logger.info("Response handler registered")

        # Set up message consumption for request exchange
        async def process_request_messages(message: aio_pika.IncomingMessage):
            async with message.process():
                try:
                    msg = json.loads(message.body.decode())
                    logger.info(f"Received request from RabbitMQ: {json.dumps(msg)}")
                    
                    for handler in request_handlers:
                        try:
                            await handler(msg)
                        except Exception as e:
                            logger.error(f"Error in request handler: {str(e)}")
                            
                except Exception as e:
                    logger.error(f"Error processing request message: {str(e)}")

        # Set up message consumption for response exchange
        async def process_response_messages(message: aio_pika.IncomingMessage):
            async with message.process():
                try:
                    msg = json.loads(message.body.decode())
                    for handler in response_handlers:
                        try:
                            await handler(msg)
                        except Exception as e:
                            logger.error(f"Error in response handler: {str(e)}")
                            
                except Exception as e:
                    logger.error(f"Error processing response message: {str(e)}")

        # Start consuming messages
        request_queue = await request_channel.declare_queue("", exclusive=True)
        await request_queue.bind(os.getenv("RABBITMQ_REQUEST_EXCHANGE", "requests"))
        await request_queue.consume(process_request_messages)

        response_queue = await response_channel.declare_queue("", exclusive=True)
        await response_queue.bind(os.getenv("RABBITMQ_RESPONSE_EXCHANGE", "responses"))
        await response_queue.consume(process_response_messages)

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

async def register_handlers(handlers: List[dict]):
    """
    Register handlers for RabbitMQ events.
    
    Args:
        handlers: List of dicts containing {'eventName': str, 'handler': Callable}
    """
    try:
        rabbit_mq = await init_rabbit_mq_connection()
        
        async def handle_message(msg):
            for handler_info in handlers:
                if handler_info['eventName'] == msg['eventName']:
                    async def send_chunk(chunk):
                        logger.info(f"Sending chunk: {json.dumps({
                            'requestId': msg['requestId'],
                            'data': chunk,
                            'isFinal': False
                        })}")
                        
                        await rabbit_mq['send_message_to_response_queue']({
                            'requestId': msg['requestId'],
                            'data': chunk,
                            'isFinal': False
                        })

                    final_result = await handler_info['handler']({
                        'payload': msg['payload'],
                        'sendChunk': send_chunk
                    })

                    await rabbit_mq['send_message_to_response_queue']({
                        'requestId': msg['requestId'],
                        'data': final_result,
                        'isFinal': True
                    })

        await rabbit_mq['register_request_queue_handler'](handle_message)
        
        # Keep the connection alive
        try:
            await asyncio.Future()  # run forever
        finally:
            await rabbit_mq['connection'].close()

    except Exception as error:
        logger.error(f"Failed to register handlers: {str(error)}")
        raise 