import json
import os
import pika
from typing import Callable, Dict, List, Any, Optional
import logging
from ..utils.load_env import load_environment_variables

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_environment_variables()

class RabbitMQConnection:
    def __init__(self):
        self.connection = None
        self.request_handlers: List[Callable] = []
        self.response_handlers: List[Callable] = []
        self.request_channel = None
        self.response_channel = None

    def _convert_payload_to_bytes(self, payload: Any) -> bytes:
        """Convert payload to bytes for RabbitMQ transmission."""
        if isinstance(payload, str):
            return payload.encode()
        return json.dumps(payload).encode()

    def _convert_message_to_object(self, message: bytes) -> Any:
        """Convert RabbitMQ message to Python object."""
        try:
            return json.loads(message.decode())
        except json.JSONDecodeError:
            return message.decode()

    async def establish_exchange(
        self,
        exchange_name: str,
        fanout: bool = False,
        on_exchange_message: Optional[Callable] = None
    ) -> Callable:
        """Establish an exchange and return a function to post messages to it."""
        channel = self.connection.channel()
        
        if fanout:
            channel.exchange_declare(
                exchange=exchange_name,
                exchange_type='fanout',
                durable=False
            )
        
        # Create a temporary queue
        result = channel.queue_declare(queue='', exclusive=True)
        queue_name = result.method.queue
        
        # Bind the queue to the exchange
        channel.queue_bind(
            exchange=exchange_name,
            queue=queue_name
        )
        
        def message_callback(ch, method, properties, body):
            try:
                msg_object = self._convert_message_to_object(body)
                if on_exchange_message:
                    on_exchange_message(msg_object)
            except Exception as err:
                logger.error(f"Error processing message: {err}")
        
        channel.basic_consume(
            queue=queue_name,
            on_message_callback=message_callback,
            auto_ack=True
        )
        
        def post_message_to_exchange(payload: Any = {}) -> None:
            """Post a message to the exchange."""
            channel.basic_publish(
                exchange=exchange_name,
                routing_key='',
                body=self._convert_payload_to_bytes(payload)
            )
        
        return post_message_to_exchange

    async def initialize(self) -> Dict[str, Any]:
        """Initialize RabbitMQ connection and set up exchanges."""
        try:
            # Establish connection
            self.connection = pika.BlockingConnection(
                pika.URLParameters(os.getenv('RABBITMQ_URL'))
            )
            
            # Request Exchange
            send_message_to_request_queue = await self.establish_exchange(
                exchange_name=os.getenv('RABBITMQ_REQUEST_EXCHANGE'),
                on_exchange_message=lambda msg: [
                    handler(msg) for handler in self.request_handlers
                ]
            )
            
            def register_request_queue_handler(handler: Callable) -> None:
                """Register a handler for request queue messages."""
                self.request_handlers.append(handler)
            
            # Response Exchange
            send_message_to_response_queue = await self.establish_exchange(
                exchange_name=os.getenv('RABBITMQ_RESPONSE_EXCHANGE'),
                fanout=True,
                on_exchange_message=lambda msg: [
                    handler(msg) for handler in self.response_handlers
                ]
            )
            
            def register_response_queue_handler(handler: Callable) -> None:
                """Register a handler for response queue messages."""
                self.response_handlers.append(handler)
            
            return {
                'connection': self.connection,
                'register_request_queue_handler': register_request_queue_handler,
                'register_response_queue_handler': register_response_queue_handler,
                'send_message_to_request_queue': send_message_to_request_queue,
                'send_message_to_response_queue': send_message_to_response_queue
            }
            
        except Exception as error:
            logger.error(f"RabbitMQ connection failed: {error}")
            raise

async def init_rabbit_mq_connection() -> Dict[str, Any]:
    """Initialize and return a RabbitMQ connection with all necessary handlers."""
    connection = RabbitMQConnection()
    return await connection.initialize() 