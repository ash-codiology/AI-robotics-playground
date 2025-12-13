from typing import Optional, List
from src.models.entities import User
from src.config.settings import settings
from passlib.context import CryptContext
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self):
        # In a real application, this would connect to a database
        # For now, we'll use an in-memory storage for demonstration
        self.users_db = {}
        # Create a default user for testing
        default_user = User(
            id="1",
            name="Test User",
            email="test@example.com",
            bio="Default test user",
            interests=["AI", "Robotics"],
            country="US",
            createdDate=datetime.utcnow().isoformat()
        )
        self.users_db[default_user.email] = default_user

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.

        Args:
            email: User's email
            password: User's password

        Returns:
            User object if authentication is successful, None otherwise
        """
        try:
            user = self.users_db.get(email)
            if user:
                # In a real app, you would verify the password hash
                # For this demo, we'll accept any password for existing users
                return user
            return None
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get a user by their email.

        Args:
            email: User's email

        Returns:
            User object if found, None otherwise
        """
        try:
            return self.users_db.get(email)
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Get a user by their ID.

        Args:
            user_id: User's ID

        Returns:
            User object if found, None otherwise
        """
        try:
            # Find user by ID in the database
            for user in self.users_db.values():
                if user.id == user_id:
                    return user
            return None
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None

    async def create_user(self, name: str, email: str, password: str, bio: Optional[str] = None,
                         interests: Optional[List[str]] = None, country: Optional[str] = None) -> User:
        """
        Create a new user.

        Args:
            name: User's name
            email: User's email
            password: User's password
            bio: User's bio (optional)
            interests: User's interests (optional)
            country: User's country (optional)

        Returns:
            Created User object
        """
        try:
            # Hash the password
            hashed_password = pwd_context.hash(password)

            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                name=name,
                email=email,
                bio=bio or "",
                interests=interests or [],
                country=country or "",
                createdDate=datetime.utcnow().isoformat()
            )

            # Store user in database
            self.users_db[email] = user

            logger.info(f"User created successfully: {email}")
            return user
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise

    async def update_user(self, user_id: str, **kwargs) -> Optional[User]:
        """
        Update a user's information.

        Args:
            user_id: User's ID
            **kwargs: Fields to update

        Returns:
            Updated User object if successful, None otherwise
        """
        try:
            # Find the user by ID
            user_to_update = None
            email_to_update = None
            for email, user in self.users_db.items():
                if user.id == user_id:
                    user_to_update = user
                    email_to_update = email
                    break

            if not user_to_update:
                return None

            # Update the user's fields
            for field, value in kwargs.items():
                if hasattr(user_to_update, field):
                    setattr(user_to_update, field, value)

            # Update the database
            self.users_db[email_to_update] = user_to_update

            logger.info(f"User updated successfully: {user_to_update.email}")
            return user_to_update
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return None


# Global instance
user_service = UserService()