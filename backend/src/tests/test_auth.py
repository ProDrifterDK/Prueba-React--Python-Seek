import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime

from src.models.user import UserCreate, UserLogin
from src.auth.service import create_user, authenticate_user, login_user

# Sample user data
sample_user_create = UserCreate(
    username="testuser",
    email="test@example.com",
    password="password123"
)

sample_user_login = UserLogin(
    username="testuser",
    password="password123"
)

sample_user_db = {
    "id": "123456",
    "username": "testuser",
    "email": "test@example.com",
    "password_hash": "$2b$12$1234567890123456789012",
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}

@pytest.mark.asyncio
@patch('src.auth.service.get_user_by_username')
@patch('src.auth.service.get_user_by_email')
@patch('src.auth.service.users_collection.insert_one')
@patch('src.auth.service.hash_password')
async def test_create_user_success(mock_hash_password, mock_insert_one, mock_get_by_email, mock_get_by_username):
    # Mock functions
    mock_get_by_username.return_value = None
    mock_get_by_email.return_value = None
    mock_hash_password.return_value = "hashed_password"
    mock_insert_one.return_value = MagicMock()
    
    # Call function
    result = await create_user(sample_user_create)
    
    # Assertions
    assert result.username == sample_user_create.username
    assert result.email == sample_user_create.email
    assert mock_get_by_username.called
    assert mock_get_by_email.called
    assert mock_hash_password.called
    assert mock_insert_one.called

@pytest.mark.asyncio
@patch('src.auth.service.get_user_by_username')
async def test_create_user_username_exists(mock_get_by_username):
    # Mock functions
    mock_get_by_username.return_value = sample_user_db
    
    # Call function and assert exception
    with pytest.raises(ValueError, match="Username already exists"):
        await create_user(sample_user_create)

@pytest.mark.asyncio
@patch('src.auth.service.get_user_by_username')
@patch('src.auth.service.verify_password')
async def test_authenticate_user_success(mock_verify_password, mock_get_by_username):
    # Mock functions
    mock_get_by_username.return_value = sample_user_db
    mock_verify_password.return_value = True
    
    # Call function
    result = await authenticate_user(sample_user_login)
    
    # Assertions
    assert result is not None
    assert result.username == sample_user_login.username
    assert mock_get_by_username.called
    assert mock_verify_password.called

@pytest.mark.asyncio
@patch('src.auth.service.get_user_by_username')
async def test_authenticate_user_not_found(mock_get_by_username):
    # Mock functions
    mock_get_by_username.return_value = None
    
    # Call function
    result = await authenticate_user(sample_user_login)
    
    # Assertions
    assert result is None
    assert mock_get_by_username.called

@pytest.mark.asyncio
@patch('src.auth.service.authenticate_user')
@patch('src.auth.service.create_access_token')
async def test_login_user_success(mock_create_access_token, mock_authenticate_user):
    # Mock functions
    mock_authenticate_user.return_value = MagicMock(
        id="123456",
        username="testuser",
        email="test@example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    mock_create_access_token.return_value = "jwt_token"
    
    # Call function
    result = await login_user(sample_user_login)
    
    # Assertions
    assert result is not None
    assert "token" in result
    assert "user" in result
    assert result["token"] == "jwt_token"
    assert result["user"].username == sample_user_login.username
    assert mock_authenticate_user.called
    assert mock_create_access_token.called

@pytest.mark.asyncio
@patch('src.auth.service.authenticate_user')
async def test_login_user_invalid_credentials(mock_authenticate_user):
    # Mock functions
    mock_authenticate_user.return_value = None
    
    # Call function and assert exception
    with pytest.raises(ValueError, match="Invalid username or password"):
        await login_user(sample_user_login)