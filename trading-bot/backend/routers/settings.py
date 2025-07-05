from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from db.database import get_db
from db.models import User, UserSettings, TradingMode
from security.auth import get_current_user, APIKeyManager

router = APIRouter()

# Pydantic models
class UserSettingsUpdate(BaseModel):
    max_position_size: Optional[float] = None
    max_daily_loss: Optional[float] = None
    stop_loss_percentage: Optional[float] = None
    take_profit_percentage: Optional[float] = None
    enable_ai_trading: Optional[bool] = None
    enable_news_sentiment: Optional[bool] = None
    risk_tolerance: Optional[str] = None  # LOW, MEDIUM, HIGH
    theme: Optional[str] = None  # light, dark

class APIKeyUpdate(BaseModel):
    service: str  # angel_one, alpha_vantage, news_api
    api_key: str

@router.get("/")
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user settings"""
    try:
        settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        
        if not settings:
            # Create default settings
            settings = UserSettings(
                user_id=current_user.id,
                max_position_size=100000.0,
                max_daily_loss=5000.0,
                stop_loss_percentage=2.0,
                take_profit_percentage=5.0,
                enable_ai_trading=True,
                enable_news_sentiment=True,
                risk_tolerance="MEDIUM",
                theme="light"
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        return {
            "user_id": current_user.id,
            "max_position_size": settings.max_position_size,
            "max_daily_loss": settings.max_daily_loss,
            "stop_loss_percentage": settings.stop_loss_percentage,
            "take_profit_percentage": settings.take_profit_percentage,
            "enable_ai_trading": settings.enable_ai_trading,
            "enable_news_sentiment": settings.enable_news_sentiment,
            "risk_tolerance": settings.risk_tolerance,
            "theme": settings.theme,
            "trading_mode": current_user.trading_mode.value,
            "paper_balance": current_user.paper_balance
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch settings: {str(e)}"
        )

@router.put("/")
async def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user settings"""
    try:
        settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        
        if not settings:
            # Create new settings if none exist
            settings = UserSettings(user_id=current_user.id)
            db.add(settings)
        
        # Update only provided fields
        update_data = settings_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(settings, field):
                # Validate specific fields
                if field == "risk_tolerance" and value not in ["LOW", "MEDIUM", "HIGH"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Risk tolerance must be LOW, MEDIUM, or HIGH"
                    )
                
                if field == "theme" and value not in ["light", "dark"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Theme must be light or dark"
                    )
                
                if field in ["max_position_size", "max_daily_loss"] and value <= 0:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"{field} must be positive"
                    )
                
                if field in ["stop_loss_percentage", "take_profit_percentage"] and (value <= 0 or value > 100):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"{field} must be between 0 and 100"
                    )
                
                setattr(settings, field, value)
        
        db.commit()
        
        return {
            "message": "Settings updated successfully",
            "updated_fields": list(update_data.keys())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )

@router.put("/trading-mode")
async def update_trading_mode(
    trading_mode: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update trading mode (PAPER or LIVE)"""
    try:
        if trading_mode not in ["PAPER", "LIVE"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trading mode must be PAPER or LIVE"
            )
        
        # Additional validation for LIVE mode
        if trading_mode == "LIVE":
            # Check if user has Angel One API keys configured
            angel_key = APIKeyManager.get_encrypted_api_key(current_user.id, "angel_one")
            if not angel_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Angel One API configuration required for live trading"
                )
        
        current_user.trading_mode = TradingMode(trading_mode)
        db.commit()
        
        return {
            "message": f"Trading mode updated to {trading_mode}",
            "trading_mode": trading_mode
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update trading mode: {str(e)}"
        )

@router.post("/api-keys")
async def store_api_key(
    api_key_data: APIKeyUpdate,
    current_user: User = Depends(get_current_user)
):
    """Store encrypted API key"""
    try:
        allowed_services = ["angel_one", "alpha_vantage", "news_api"]
        
        if api_key_data.service not in allowed_services:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Service must be one of: {', '.join(allowed_services)}"
            )
        
        if not api_key_data.api_key or len(api_key_data.api_key.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="API key must be at least 5 characters long"
            )
        
        # Store encrypted API key
        APIKeyManager.store_encrypted_api_key(
            current_user.id,
            api_key_data.service,
            api_key_data.api_key.strip()
        )
        
        return {
            "message": f"API key for {api_key_data.service} stored successfully",
            "service": api_key_data.service
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store API key: {str(e)}"
        )

@router.get("/api-keys")
async def get_api_keys_status(current_user: User = Depends(get_current_user)):
    """Get status of configured API keys"""
    try:
        services = ["angel_one", "alpha_vantage", "news_api"]
        api_key_status = {}
        
        for service in services:
            api_key = APIKeyManager.get_encrypted_api_key(current_user.id, service)
            api_key_status[service] = {
                "configured": api_key is not None,
                "masked_key": f"***{api_key[-4:]}" if api_key and len(api_key) > 4 else None
            }
        
        return {
            "api_keys": api_key_status,
            "timestamp": "2025-07-05T10:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get API key status: {str(e)}"
        )

@router.delete("/api-keys/{service}")
async def delete_api_key(
    service: str,
    current_user: User = Depends(get_current_user)
):
    """Delete stored API key"""
    try:
        allowed_services = ["angel_one", "alpha_vantage", "news_api"]
        
        if service not in allowed_services:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Service must be one of: {', '.join(allowed_services)}"
            )
        
        APIKeyManager.delete_api_key(current_user.id, service)
        
        return {
            "message": f"API key for {service} deleted successfully",
            "service": service
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete API key: {str(e)}"
        )

@router.get("/risk-profile")
async def get_risk_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's risk profile and recommendations"""
    try:
        settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        
        if not settings:
            return {
                "risk_tolerance": "MEDIUM",
                "recommendations": {
                    "max_position_size": 100000.0,
                    "max_daily_loss": 5000.0,
                    "stop_loss_percentage": 2.0,
                    "take_profit_percentage": 5.0
                }
            }
        
        # Risk-based recommendations
        risk_recommendations = {
            "LOW": {
                "max_position_size": min(settings.max_position_size, 50000.0),
                "max_daily_loss": min(settings.max_daily_loss, 2000.0),
                "stop_loss_percentage": max(settings.stop_loss_percentage, 1.5),
                "take_profit_percentage": min(settings.take_profit_percentage, 3.0)
            },
            "MEDIUM": {
                "max_position_size": settings.max_position_size,
                "max_daily_loss": settings.max_daily_loss,
                "stop_loss_percentage": settings.stop_loss_percentage,
                "take_profit_percentage": settings.take_profit_percentage
            },
            "HIGH": {
                "max_position_size": settings.max_position_size * 1.5,
                "max_daily_loss": settings.max_daily_loss * 1.5,
                "stop_loss_percentage": max(settings.stop_loss_percentage * 0.8, 1.0),
                "take_profit_percentage": settings.take_profit_percentage * 1.2
            }
        }
        
        current_recommendations = risk_recommendations.get(settings.risk_tolerance, risk_recommendations["MEDIUM"])
        
        return {
            "risk_tolerance": settings.risk_tolerance,
            "current_settings": {
                "max_position_size": settings.max_position_size,
                "max_daily_loss": settings.max_daily_loss,
                "stop_loss_percentage": settings.stop_loss_percentage,
                "take_profit_percentage": settings.take_profit_percentage
            },
            "recommendations": current_recommendations,
            "risk_description": {
                "LOW": "Conservative approach with strict risk controls",
                "MEDIUM": "Balanced approach with moderate risk",
                "HIGH": "Aggressive approach with higher risk tolerance"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get risk profile: {str(e)}"
        )
