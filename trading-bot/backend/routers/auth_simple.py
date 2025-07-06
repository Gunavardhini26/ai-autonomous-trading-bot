from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    username: str
    email: str
    message: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user (simplified version)"""
    
    # Basic validation
    if len(user.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )
    
    # For now, just return success (no actual database storage)
    return UserResponse(
        username=user.username,
        email=user.email,
        message="User registered successfully! (Demo mode - no actual storage)"
    )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """Login user (simplified version)"""
    
    # Demo credentials
    if login_data.username == "demo" and login_data.password == "demo123":
        return Token(
            access_token="demo_token_12345",
            token_type="bearer"
        )
    
    raise HTTPException(
        status_code=401,
        detail="Invalid credentials. Try: username=demo, password=demo123"
    )

@router.get("/me")
async def get_current_user():
    """Get current user info (simplified version)"""
    return {
        "username": "demo",
        "email": "demo@example.com",
        "is_active": True
    }
