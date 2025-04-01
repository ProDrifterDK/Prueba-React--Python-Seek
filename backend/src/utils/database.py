import os
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection

# Get MongoDB URI from environment variable with a default value
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://mongodb:27017/task-management")

# MongoDB client instance
client = None

def get_database() -> Database:
    """
    Get MongoDB database instance.
    
    Returns:
        Database: MongoDB database instance
    """
    global client
    
    if client is None:
        # Create MongoDB client
        client = MongoClient(MONGODB_URI)
    
    # Return database instance
    return client.task_management

def get_collection(collection_name: str) -> Collection:
    """
    Get MongoDB collection instance.
    
    Args:
        collection_name (str): Name of the collection
        
    Returns:
        Collection: MongoDB collection instance
    """
    db = get_database()
    return db[collection_name]

def close_connection():
    """
    Close MongoDB connection.
    """
    global client
    
    if client is not None:
        client.close()
        client = None