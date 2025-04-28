import json
import logging
from register_handlers import register_handlers

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_request_handler(context):
    """
    Handler for test requests that simulates streaming data.
    
    Args:
        context: Dictionary containing 'payload' and 'sendChunk' function
    """
    payload = context['payload']
    send_chunk = context['sendChunk']
    
    request_id = payload.get('requestId')
    logger.info(f"Processing testRequest with payload: {payload}")
    logger.info(f"Received requestId: {request_id}")

    # Simulate streaming data
    await send_chunk("Chunk 1")
    logger.info(f"Sent Chunk 1 with requestId: {request_id}")
    
    await send_chunk("Chunk 2")
    logger.info(f"Sent Chunk 2 with requestId: {request_id}")

    # Return final data
    return "Final Chunk"

async def main():
    """
    Main function to register handlers and start the service.
    """
    # Define handlers
    handlers = [
        ("testRequest", test_request_handler)
    ]

    # Register handlers and start consuming
    await register_handlers(handlers)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())