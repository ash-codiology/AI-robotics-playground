from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional
from src.models.entities import LoginRequest, LoginResponse, RegisterRequest, User
from src.api.middleware.auth import auth_handler, authenticate_user
from src.config.settings import settings
from src.services.user_service import user_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login endpoint to authenticate user and return JWT token.

    Args:
        request: LoginRequest containing email and password

    Returns:
        LoginResponse containing user info and JWT token
    """
    try:
        # Validate email format
        if not request.email or '@' not in request.email:
            raise HTTPException(status_code=400, detail="Invalid email format")

        # Validate password length
        if not request.password or len(request.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

        # Authenticate user (in a real app, this would check the database)
        # For now, we'll create a mock authentication that accepts any credentials
        # In a real implementation, you would verify the password against a stored hash
        user = await user_service.authenticate_user(request.email, request.password)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Generate JWT token
        token = auth_handler.encode_token(user.id)

        logger.info(f"User {user.email} logged in successfully")

        return LoginResponse(
            success=True,
            user=user,
            token=token,
            message="Login successful"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during login"
        )


@router.post("/auth/register", response_model=LoginResponse)
async def register(request: RegisterRequest):
    """
    Register endpoint to create a new user and return JWT token.

    Args:
        request: RegisterRequest containing user registration data

    Returns:
        LoginResponse containing user info and JWT token
    """
    try:
        # Validate required fields
        if not request.email or '@' not in request.email:
            raise HTTPException(status_code=400, detail="Valid email is required")

        if not request.password or len(request.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

        if not request.name:
            raise HTTPException(status_code=400, detail="Name is required")

        # Check if user already exists
        existing_user = await user_service.get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(status_code=409, detail="User with this email already exists")

        # Create new user
        user = await user_service.create_user(
            name=request.name,
            email=request.email,
            password=request.password,
            bio=request.bio,
            interests=request.interests,
            country=request.country
        )

        # Generate JWT token
        token = auth_handler.encode_token(user.id)

        logger.info(f"New user {user.email} registered successfully")

        return LoginResponse(
            success=True,
            user=user,
            token=token,
            message="Registration successful"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during registration"
        )


@router.post("/auth/verify-token")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(auth_handler.security)):
    """
    Verify endpoint to check if the provided token is valid.

    Args:
        credentials: HTTP authorization credentials from the request header

    Returns:
        Success message if token is valid
    """
    try:
        user_id = auth_handler.decode_token(credentials.credentials)
        user = await user_service.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "success": True,
            "message": "Token is valid",
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during token verification: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during token verification"
        )


@router.get("/auth/me", response_model=User)
async def get_current_user(current_user_id: str = Depends(authenticate_user)):
    """
    Get current user endpoint to retrieve user information.

    Args:
        current_user_id: User ID from the authenticated token

    Returns:
        User information
    """
    try:
        user = await user_service.get_user_by_id(current_user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user info: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred retrieving user information"
        )