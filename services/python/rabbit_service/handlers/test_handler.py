"""
Test handler implementation
"""
import asyncio
import json
import logging
from typing import Any, Awaitable, Callable, Dict

from rabbit_service.rabbit import register_handlers

logger = logging.getLogger(__name__)

async def test_request_handler(
    payload: Dict[str, Any],
    send_chunk: Callable[[Any], Awaitable[None]]
) -> str:
    """
    Test handler that demonstrates streaming functionality.
    
    Args:
        payload: The request payload data
        send_chunk: Async function to send intermediate data chunks
    
    Returns:
        str: Final response message
    """
    logger.info(f"Processing testRequest with payload: {json.dumps(payload)}")
    
    # Simulate streaming data
    await send_chunk('Chunk 1')
    await send_chunk('Chunk 2')
    
    # Return final data
    return 'Final Chunk'

if __name__ == "__main__":
    handlers = [
        {
            'eventName': 'testRequest',
            'handler': test_request_handler
        }
    ]
    
    asyncio.run(register_handlers(handlers)) 