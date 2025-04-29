"""
Utility functions for the RabbitMQ service
"""
import os
from pathlib import Path
from dotenv import load_dotenv

def load_environment_variables():
    """Load environment variables from .env file in the project root."""
    # Get the project root directory
    project_root = Path(__file__).parent.parent.parent
    
    # Path to .env file
    env_path = project_root / '.env'
    
    # Load environment variables from .env file
    if env_path.exists():
        load_dotenv(env_path)
    else:
        raise FileNotFoundError(f".env file not found at {env_path}") 