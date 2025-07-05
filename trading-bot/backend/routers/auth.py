from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional

from db.database import get_db
from db.models import User, UserSettings, TradingMode
from security.auth import (
    authenticate_user, create_access_token, get_password_hash, 
    verify_password, validate_password_strength, get_current_user,
    blacklist_token, log_security_event
)
from config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    trading_mode: str
    paper_balance: float
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class TradingModeUpdate(BaseModel):
    trading_mode: str  # "PAPER" or "LIVE"

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if username already exists
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate password strength
        if not validate_password_strength(user_data.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            trading_mode=TradingMode.PAPER,
            paper_balance=1000000.0  # 10L INR default
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create default user settings
        user_settings = UserSettings(
            user_id=db_user.id,
            max_position_size=100000.0,
            max_daily_loss=5000.0,
            stop_loss_percentage=2.0,
            take_profit_percentage=5.0,
            enable_ai_trading=True,
            enable_news_sentiment=True,
            risk_tolerance="MEDIUM",
            theme="light"
        )
        
        db.add(user_settings)
        db.commit()
        
        # Log security event
        log_security_event(
            db_user.id, 
            "user_registration", 
            {"username": user_data.username, "email": user_data.email}
        )
        
        return {
            "message": "User registered successfully",
            "user_id": db_user.id,
            "username": db_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and return access token"""
    try:
        # Authenticate user
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            log_security_event(
                0,  # Unknown user ID
                "failed_login",
                {"username": form_data.username, "reason": "invalid_credentials"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            log_security_event(
                user.id,
                "failed_login",
                {"username": form_data.username, "reason": "account_disabled"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is disabled"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        # Log successful login
        log_security_event(
            user.id,
            "successful_login",
            {"username": user.username}
        )
        
        # Prepare user response
        user_response = UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            trading_mode=user.trading_mode.value,
            paper_balance=user.paper_balance
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_user)):
    """Logout user and blacklist token"""
    try:
        # Note: In a real implementation, you'd need to get the actual token
        # from the request headers to blacklist it
        
        log_security_event(
            current_user.id,
            "user_logout",
            {"username": current_user.username}
        )
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
        trading_mode=current_user.trading_mode.value,
        paper_balance=current_user.paper_balance
    )

@router.put("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password strength
        if not validate_password_strength(password_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
            )
        
        # Update password
        current_user.hashed_password = get_password_hash(password_data.new_password)
        db.commit()
        
        # Log security event
        log_security_event(
            current_user.id,
            "password_change",
            {"username": current_user.username}
        )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.put("/trading-mode")
async def update_trading_mode(
    mode_data: TradingModeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user trading mode (PAPER or LIVE)"""
    try:
        if mode_data.trading_mode not in ["PAPER", "LIVE"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trading mode must be either 'PAPER' or 'LIVE'"
            )
        
        # Update trading mode
        current_user.trading_mode = TradingMode(mode_data.trading_mode)
        db.commit()
        
        # Log security event
        log_security_event(
            current_user.id,
            "trading_mode_change",
            {
                "username": current_user.username,
                "new_mode": mode_data.trading_mode
            }
        )
        
        return {
            "message": f"Trading mode updated to {mode_data.trading_mode}",
            "trading_mode": mode_data.trading_mode
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Trading mode update failed"
        )

@router.get("/profile/complete")
async def get_complete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete user profile including settings"""
    try:
        # Get user settings
        settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        
        profile_data = {
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
                "is_active": current_user.is_active,
                "trading_mode": current_user.trading_mode.value,
                "paper_balance": current_user.paper_balance,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None
            },
            "settings": {
                "max_position_size": settings.max_position_size if settings else 100000.0,
                "max_daily_loss": settings.max_daily_loss if settings else 5000.0,
                "stop_loss_percentage": settings.stop_loss_percentage if settings else 2.0,
                "take_profit_percentage": settings.take_profit_percentage if settings else 5.0,
                "enable_ai_trading": settings.enable_ai_trading if settings else True,
                "enable_news_sentiment": settings.enable_news_sentiment if settings else True,
                "risk_tolerance": settings.risk_tolerance if settings else "MEDIUM",
                "theme": settings.theme if settings else "light"
            }
        }
        
        return profile_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )
