from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
import logging

from src.models.user import UserCreate, UserLogin, UserResponse
from src.auth.service import create_user, login_user, get_user_by_id
from src.utils.auth import get_current_user

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """
    Register a new user.
    
    Args:
        user (UserCreate): User data
        
    Returns:
        UserResponse: Created user
    """
    try:
        logger.info(f"Registering user with username: {user.username}")
        # Create user
        return await create_user(user)
    except ValueError as e:
        # Handle validation errors
        logger.error(f"Validation error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        # Handle other errors
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while registering the user: {str(e)}",
        )

@router.post("/login")
async def login(user_login: UserLogin):
    """
    Login a user.
    
    Args:
        user_login (UserLogin): User login data
        
    Returns:
        Dict: Token and user data
    """
    try:
        logger.info(f"Login attempt for user: {user_login.username}")
        # Login user
        return await login_user(user_login)
    except ValueError as e:
        # Handle validation errors
        logger.error(f"Authentication error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    except Exception as e:
        # Handle other errors
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while logging in: {str(e)}",
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information.
    
    Args:
        current_user (dict): Current user data from token
        
    Returns:
        UserResponse: User information
    """
    try:
        logger.info(f"Getting user info for user_id: {current_user['user_id']}")
        # Get user by ID
        user = await get_user_by_id(current_user["user_id"])
        
        # Check if user exists
        if not user:
            logger.error(f"User not found with ID: {current_user['user_id']}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Return user response
        return UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            created_at=user["created_at"],
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle other errors
        logger.error(f"Unexpected error getting user info: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while getting user information: {str(e)}",
        )