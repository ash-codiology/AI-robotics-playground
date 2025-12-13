from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from src.config.settings import settings
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import jwt
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthHandler:
    def __init__(self):
        self.secret_key = settings.secret_key
        self.algorithm = settings.algorithm
        self.security = HTTPBearer()

    def encode_token(self, user_id: str) -> str:
        """Encode a JWT token for the given user ID."""
        payload = {
            'exp': datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes),
            'iat': datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> Optional[str]:
        """Decode a JWT token and return the user ID if valid."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload['sub']
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            raise HTTPException(status_code=401, detail="Invalid token")


auth_handler = AuthHandler()


async def authenticate_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Authentication dependency that validates the provided token.

    Args:
        credentials: HTTP authorization credentials from the request header

    Returns:
        The user ID if authentication is successful

    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    return user_id


def require_auth():
    """
    Dependency that requires authentication.

    This can be used in route definitions to enforce authentication.
    """
    return Security(authenticate_user)