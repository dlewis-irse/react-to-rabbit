"""
Main entry point for the RabbitMQ service
"""
import asyncio
import logging

from rabbit_service.handlers.test_handler import test_request_handler
from rabbit_service.register_handlers import register_handlers

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
        
    except KeyboardInterrupt:
        logger.info("Service stopped by user.")
    except Exception as e:
        logger.error(f"Service failed: {e}")
        raise

def run():
    """Entry point for the Poetry script."""
    asyncio.run(main())

if __name__ == "__main__":
    run() 