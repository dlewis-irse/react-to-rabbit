import json
import logging
import asyncio
from typing import List, Dict, Callable, Any, Tuple
import aio_pika
from aio_pika.abc import AbstractChannel, AbstractConnection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def register_handlers(handlers: List[Tuple[str, Callable]]):
    """
    Register handlers for RabbitMQ events.
    
    Args:
        handlers: List of tuples containing (event_name, handler_function)
    """
    try:
        # Connect to RabbitMQ
        connection = await aio_pika.connect_robust(
            "amqp://esri_admin:esri_password@localhost/"
        )
        
        async with connection:
            # Create a channel
            channel = await connection.channel()
            
            # Declare the exchange for requests
            requests_exchange = await channel.declare_exchange(
                "requests",
                aio_pika.ExchangeType.DIRECT,
                durable=True
            )
            
            # Declare the exchange for responses
            responses_exchange = await channel.declare_exchange(
                "responses",
                aio_pika.ExchangeType.DIRECT,
                durable=True
            )

            # Create and bind the websocket responses queue
            websocket_queue = await channel.declare_queue(
                "websocket_responses",
                durable=True
            )
            await websocket_queue.bind(
                responses_exchange,
                routing_key=''  # Empty routing key as per spec
            )

            for event_name, handler in handlers:
                # Create a queue for the event
                queue = await channel.declare_queue(
                    event_name,
                    durable=True
                )

                # Bind the queue to the exchange with the event name as the routing key
                await queue.bind(
                    requests_exchange,
                    routing_key=event_name
                )

                logger.info(f"Handler registered for event: {event_name}")

                async def process_message(message: aio_pika.IncomingMessage):
                    async with message.process():
                        try:
                            # Parse the message body
                            body = message.body.decode()
                            message_data = json.loads(body)
                            
                            # Get request ID from the message data
                            request_id = message_data.get('requestId')
                            if not request_id:
                                logger.error("Missing requestId in message data")
                                return
                                
                            payload = message_data.get('payload', {})
                            logger.info(f"Processing message with requestId: {request_id}")

                            async def send_chunk(chunk):
                                await responses_exchange.publish(
                                    aio_pika.Message(
                                        body=json.dumps({
                                            'requestId': request_id,
                                            'data': chunk,
                                            'isFinal': False
                                        }).encode(),
                                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                                    ),
                                    routing_key=''  # Empty routing key as per spec
                                )

                            # Execute the handler with the request ID in the payload
                            handler_payload = {
                                'requestId': request_id,
                                **payload
                            }
                            
                            final_data = await handler({
                                'payload': handler_payload,
                                'sendChunk': send_chunk
                            })
                            
                            # Send final response
                            await responses_exchange.publish(
                                aio_pika.Message(
                                    body=json.dumps({
                                        'requestId': request_id,
                                        'data': final_data,
                                        'isFinal': True
                                    }).encode(),
                                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                                ),
                                routing_key=''  # Empty routing key as per spec
                            )
                        except Exception as error:
                            logger.error(f"Error in handler for event {event_name}: {str(error)}")
                            if request_id:
                                await responses_exchange.publish(
                                    aio_pika.Message(
                                        body=json.dumps({
                                            'requestId': request_id,
                                            'error': str(error),
                                            'isFinal': True
                                        }).encode(),
                                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                                    ),
                                    routing_key=''  # Empty routing key as per spec
                                )

                # Start consuming
                await queue.consume(process_message)

            logger.info("All handlers registered successfully")
            
            # Keep the connection alive
            try:
                await asyncio.Future()  # run forever
            finally:
                await connection.close()

    except Exception as error:
        logger.error(f"Failed to register handlers: {str(error)}")
        raise 