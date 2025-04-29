#!/usr/bin/env python3
import asyncio
import logging
from .handlers.test_request_handler import test_request_handler
from .shared.utils.register_handlers import register_handlers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """Main entry point for the Python service."""
    try:
        # Register the test handler
        handlers = [
            {
                'eventName': 'testRequest',
                'handler': test_request_handler
            }
        ]
        
        # Run the registration
        await register_handlers(handlers)
        
        # Keep the service running
        logger.info("Service started successfully. Press Ctrl+C to stop.")
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Service stopped by user.")
    except Exception as e:
        logger.error(f"Service failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 