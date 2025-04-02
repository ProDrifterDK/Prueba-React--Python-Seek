import os
import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get MongoDB URI from environment variable with a default value
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://mongodb:27017/task-management")

# MongoDB client instance
client = None

def get_database() -> AsyncIOMotorDatabase:
    """
    Get MongoDB database instance.
    
    Returns:
        AsyncIOMotorDatabase: MongoDB database instance
    """
    global client
    
    if client is None:
        try:
            # Create MongoDB client
            logger.info(f"Connecting to MongoDB at {MONGODB_URI}")
            client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
            logger.info("MongoDB connection established")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {str(e)}", exc_info=True)
            raise
    
    # Return database instance
    return client.task_management

def get_collection(collection_name: str) -> AsyncIOMotorCollection:
    """
    Get MongoDB collection instance.
    
    Args:
        collection_name (str): Name of the collection
        
    Returns:
        AsyncIOMotorCollection: MongoDB collection instance
    """
    try:
        db = get_database()
        logger.info(f"Getting collection: {collection_name}")
        return db[collection_name]
    except Exception as e:
        logger.error(f"Error getting collection {collection_name}: {str(e)}", exc_info=True)
        raise

async def close_connection():
    """
    Close MongoDB connection.
    """
    global client
    
    if client is not None:
        logger.info("Closing MongoDB connection")
        client.close()
        client = None