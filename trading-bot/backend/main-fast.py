from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Fast AI Trading Bot Backend
app = FastAPI(
    title="AI Trading Bot - Fast Mode",
    description="Lightning-fast trading platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class MarketData(BaseModel):
    symbol: str
    price: float
    change: float
    volume: int

class OrderRequest(BaseModel):
    symbol: str
    quantity: int
    price: float
    order_type: str

# Mock data for fast startup
MOCK_MARKET_DATA = [
    {"symbol": "RELIANCE", "price": 2456.50, "change": 12.30, "volume": 1234567},
    {"symbol": "TCS", "price": 3421.20, "change": -8.90, "volume": 987654},
    {"symbol": "HDFCBANK", "price": 1598.75, "change": 23.45, "volume": 2345678},
    {"symbol": "INFY", "price": 1456.80, "change": 34.20, "volume": 3456789},
    {"symbol": "NIFTY50", "price": 19845.60, "change": 145.30, "volume": 0}
]

# API Routes
@app.get("/")
async def root():
    return {"message": "AI Trading Bot API - Fast Mode", "status": "running"}

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    # Mock authentication
    if request.email == "demo@example.com" and request.password == "demo123":
        return {
            "access_token": "mock_token_123",
            "token_type": "bearer",
            "user": {
                "id": "1",
                "email": request.email,
                "name": "Demo User"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/market/live-prices")
async def get_live_prices():
    return {"data": MOCK_MARKET_DATA}

@app.get("/api/market/watchlist")
async def get_watchlist():
    return {"symbols": ["RELIANCE", "TCS", "HDFCBANK", "INFY", "NIFTY50"]}

@app.post("/api/trading/place-order")
async def place_order(order: OrderRequest):
    return {
        "order_id": "ORD_123456",
        "symbol": order.symbol,
        "quantity": order.quantity,
        "price": order.price,
        "status": "placed"
    }

@app.get("/api/portfolio/overview")
async def get_portfolio():
    return {
        "total_value": 125000.50,
        "day_pnl": 2450.30,
        "total_pnl": 15750.80,
        "available_margin": 50000.00
    }

@app.get("/api/trading/positions")
async def get_positions():
    return {
        "positions": [
            {
                "symbol": "RELIANCE",
                "quantity": 100,
                "avg_price": 2400.00,
                "current_price": 2456.50,
                "pnl": 5650.00
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
