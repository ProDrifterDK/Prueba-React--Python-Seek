import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional

from src.models.user import UserCreate, UserInDB, UserResponse, UserLogin
from src.utils.database import get_collection
from src.utils.auth import hash_password, verify_password, create_access_token

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# User collection
users_collection = get_collection("users")

async def create_user(user: UserCreate) -> UserResponse:
    """
    Create a new user.
    
    Args:
        user (UserCreate): User data
        
    Returns:
        UserResponse: Created user
        
    Raises:
        ValueError: If username or email already exists
    """
    try:
        # Check if username already exists
        if await get_user_by_username(user.username):
            logger.warning(f"Username already exists: {user.username}")
            raise ValueError("Username already exists")
        
        # Check if email already exists
        if await get_user_by_email(user.email):
            logger.warning(f"Email already exists: {user.email}")
            raise ValueError("Email already exists")
        
        # Generate user ID
        user_id = str(uuid.uuid4())
        
        # Get current time
        now = datetime.utcnow()
        
        # Create user document
        user_doc = UserInDB(
            id=user_id,
            username=user.username,
            email=user.email,
            password_hash=hash_password(user.password),
            created_at=now,
            updated_at=now,
        )
        
        logger.info(f"Inserting new user with ID: {user_id}")
        # Insert user document
        await users_collection.insert_one(user_doc.dict())
        
        # Return user response
        return UserResponse(
            id=user_id,
            username=user.username,
            email=user.email,
            created_at=now,
        )
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        raise

async def authenticate_user(user_login: UserLogin) -> Optional[UserInDB]:
    """
    Authenticate a user.
    
    Args:
        user_login (UserLogin): User login data
        
    Returns:
        Optional[UserInDB]: User if authentication successful, None otherwise
    """
    try:
        # Get user by username
        user = await get_user_by_username(user_login.username)
        
        # Check if user exists and password is correct
        if user and verify_password(user_login.password, user["password_hash"]):
            logger.info(f"User authenticated successfully: {user_login.username}")
            return UserInDB(**user)
        
        logger.warning(f"Authentication failed for user: {user_login.username}")
        return None
    except Exception as e:
        logger.error(f"Error authenticating user: {str(e)}", exc_info=True)
        raise

async def login_user(user_login: UserLogin) -> Dict:
    """
    Login a user.
    
    Args:
        user_login (UserLogin): User login data
        
    Returns:
        Dict: Token and user data
        
    Raises:
        ValueError: If authentication fails
    """
    try:
        # Authenticate user
        user = await authenticate_user(user_login)
        
        # Check if authentication successful
        if not user:
            logger.warning(f"Invalid login attempt for username: {user_login.username}")
            raise ValueError("Invalid username or password")
        
        # Create access token
        token = create_access_token(
            data={"user_id": user.id, "username": user.username},
            expires_delta=timedelta(minutes=60 * 24),  # 24 hours
        )
        
        logger.info(f"Login successful for user: {user_login.username}")
        # Return token and user data
        return {
            "token": token,
            "user": UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                created_at=user.created_at,
            ),
        }
    except Exception as e:
        logger.error(f"Error during login: {str(e)}", exc_info=True)
        raise

async def get_user_by_id(user_id: str) -> Optional[Dict]:
    """
    Get a user by ID.
    
    Args:
        user_id (str): User ID
        
    Returns:
        Optional[Dict]: User document if found, None otherwise
    """
    try:
        logger.info(f"Getting user by ID: {user_id}")
        return await users_collection.find_one({"id": user_id})
    except Exception as e:
        logger.error(f"Error getting user by ID: {str(e)}", exc_info=True)
        raise

async def get_user_by_username(username: str) -> Optional[Dict]:
    """
    Get a user by username.
    
    Args:
        username (str): Username
        
    Returns:
        Optional[Dict]: User document if found, None otherwise
    """
    try:
        logger.info(f"Getting user by username: {username}")
        return await users_collection.find_one({"username": username})
    except Exception as e:
        logger.error(f"Error getting user by username: {str(e)}", exc_info=True)
        raise

async def get_user_by_email(email: str) -> Optional[Dict]:
    """
    Get a user by email.
    
    Args:
        email (str): Email
        
    Returns:
        Optional[Dict]: User document if found, None otherwise
    """
    try:
        logger.info(f"Getting user by email: {email}")
        return await users_collection.find_one({"email": email})
    except Exception as e:
        logger.error(f"Error getting user by email: {str(e)}", exc_info=True)
        raise