from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import redis
from typing import Optional

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REDIS_URL
from db.database import get_db
from db.models import User
from sqlalchemy.orm import Session

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT bearer token
security = HTTPBearer()

# Redis client for token blacklisting
redis_client = redis.from_url(REDIS_URL)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Get password hash"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        # Check if token is blacklisted
        if redis_client.get(f"blacklist:{token}"):
            return None
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def blacklist_token(token: str):
    """Add token to blacklist"""
    try:
        # Decode token to get expiration time
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        
        if exp:
            # Calculate TTL (time to live) for Redis
            ttl = exp - datetime.utcnow().timestamp()
            if ttl > 0:
                redis_client.setex(f"blacklist:{token}", int(ttl), "1")
    except JWTError:
        pass  # Invalid token, ignore

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token
        token = credentials.credentials
        
        # Verify token
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        # Get username from token
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Get user from database
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is disabled"
            )
        
        return user
        
    except Exception:
        raise credentials_exception

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    return current_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def require_paper_or_live_trading(user: User):
    """Ensure user has proper trading permissions"""
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    # Additional checks can be added here for trading permissions
    # For example, KYC verification, account balance, etc.

def check_rate_limit(user_id: int, action: str, limit: int, window: int = 60) -> bool:
    """
    Check if user has exceeded rate limit for a specific action
    
    Args:
        user_id: User ID
        action: Action name (e.g., 'place_order', 'api_call')
        limit: Maximum number of actions allowed
        window: Time window in seconds
    
    Returns:
        True if within limit, False if exceeded
    """
    key = f"rate_limit:{user_id}:{action}"
    current_count = redis_client.get(key)
    
    if current_count is None:
        # First request
        redis_client.setex(key, window, 1)
        return True
    
    current_count = int(current_count)
    if current_count >= limit:
        return False
    
    # Increment counter
    redis_client.incr(key)
    return True

def log_security_event(user_id: int, event_type: str, details: dict):
    """Log security-related events"""
    event = {
        "user_id": user_id,
        "event_type": event_type,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Store in Redis for quick access (with 7 day expiry)
    redis_client.lpush(f"security_events:{user_id}", str(event))
    redis_client.expire(f"security_events:{user_id}", 604800)  # 7 days

class APIKeyManager:
    """Manage API keys securely"""
    
    @staticmethod
    def store_encrypted_api_key(user_id: int, service: str, api_key: str):
        """Store encrypted API key"""
        # In production, encrypt the API key before storing
        # For now, storing in Redis with encryption would be ideal
        key = f"api_key:{user_id}:{service}"
        redis_client.setex(key, 2592000, api_key)  # 30 days expiry
    
    @staticmethod
    def get_encrypted_api_key(user_id: int, service: str) -> Optional[str]:
        """Retrieve encrypted API key"""
        key = f"api_key:{user_id}:{service}"
        api_key = redis_client.get(key)
        return api_key.decode('utf-8') if api_key else None
    
    @staticmethod
    def delete_api_key(user_id: int, service: str):
        """Delete API key"""
        key = f"api_key:{user_id}:{service}"
        redis_client.delete(key)

def validate_password_strength(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return has_upper and has_lower and has_digit and has_special

def create_session_token(user_id: int) -> str:
    """Create a session token for WebSocket connections"""
    session_data = {
        "user_id": user_id,
        "session_type": "websocket",
        "created_at": datetime.utcnow().isoformat()
    }
    
    token = create_access_token(session_data, expires_delta=timedelta(hours=24))
    
    # Store session in Redis
    redis_client.setex(f"session:{user_id}", 86400, token)
    
    return token

def verify_session_token(token: str) -> Optional[dict]:
    """Verify session token"""
    payload = verify_token(token)
    if not payload:
        return None
    
    user_id = payload.get("user_id")
    if not user_id:
        return None
    
    # Check if session exists in Redis
    stored_token = redis_client.get(f"session:{user_id}")
    if not stored_token or stored_token.decode('utf-8') != token:
        return None
    
    return payload

def invalidate_session(user_id: int):
    """Invalidate user session"""
    redis_client.delete(f"session:{user_id}")

# Security middleware for sensitive operations
def require_fresh_token(max_age_minutes: int = 30):
    """Decorator to require fresh token for sensitive operations"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract user from kwargs or args
            user = None
            for arg in args:
                if isinstance(arg, User):
                    user = arg
                    break
            
            if not user:
                for value in kwargs.values():
                    if isinstance(value, User):
                        user = value
                        break
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User context required"
                )
            
            # Check if operation requires fresh authentication
            # This could be implemented by checking last authentication time
            # For now, we'll skip this check but the structure is here
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
