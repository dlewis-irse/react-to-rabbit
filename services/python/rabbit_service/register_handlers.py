"""
Handler registration and orchestration for RabbitMQ
"""
import asyncio
import json
import logging
from typing import List, Dict, Any, Callable

from dotenv import load_dotenv
from rabbit_service.rabbit_mq.init_rabbit_mq_connection import init_rabbit_mq_connection

logger = logging.getLogger(__name__)

async def register_handlers(handlers: List[Dict[str, Any]] = []):
    """
    Register handlers for RabbitMQ events.
    
    Args:
        handlers: List of dicts containing {'eventName': str, 'handler': Callable}
    """
    # Load environment variables
    load_dotenv()
    
    # Initialize RabbitMQ connection
    rabbit_mq = await init_rabbit_mq_connection()
    
    async def handle_message(msg: Dict[str, Any]):
        """Process incoming messages and route to appropriate handler."""
        logger.info(f"Handler Orchestrator Received request from RabbitMQ: {json.dumps(msg)}")
        
        for handler_info in handlers:
            if handler_info['eventName'] == msg.get('eventName'):
                try:
                    async def send_chunk(chunk: Any):
                        message = {
                            'requestId': msg['requestId'],
                            'data': chunk,
                            'isFinal': False
                        }
                        logger.info(f"Sending chunk: {json.dumps(message)}")
                        await rabbit_mq['send_message_to_response_queue'](message)

                    final_result = await handler_info['handler']({
                        'payload': msg.get('payload', {}),
                        'sendChunk': send_chunk
                    })

                    await rabbit_mq['send_message_to_response_queue']({
                        'requestId': msg['requestId'],
                        'data': final_result,
                        'isFinal': True
                    })
                except Exception as e:
                    logger.error(f"Error in handler for event {handler_info['eventName']}: {str(e)}")
                    await rabbit_mq['send_message_to_response_queue']({
                        'requestId': msg['requestId'],
                        'error': str(e),
                        'isFinal': True
                    })

    # Register the message handler
    rabbit_mq['register_request_queue_handler'](handle_message)
    
    try:
        # Keep the connection alive
        await asyncio.Future()  # run forever
    finally:
        await rabbit_mq['connection'].close() 