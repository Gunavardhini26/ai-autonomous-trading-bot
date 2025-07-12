from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
import json
import logging
from datetime import datetime, timedelta
import uuid
import uvicorn
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="AI Trading Bot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# In-memory storage for demo
data_store = {
    "users": {},
    "portfolios": {},
    "orders": {},
    "market_data": {},
    "ai_signals": {},
    "trades": []
}

# WebSocket connections
active_connections: List[WebSocket] = []

# Pydantic models
class User(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user_id: str
    email: str

class PortfolioData(BaseModel):
    total_value: float
    daily_pnl: float
    positions: List[Dict]
    cash_balance: float

class Order(BaseModel):
    symbol: str
    side: str
    quantity: int
    price: float
    order_type: str

# Helper functions
def generate_token():
    return str(uuid.uuid4())

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token not in data_store["users"]:
        raise HTTPException(status_code=401, detail="Invalid token")
    return data_store["users"][token]

async def broadcast_to_websockets(message: dict):
    if active_connections:
        for connection in active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                active_connections.remove(connection)

# Authentication endpoints
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(user: User):
    token = generate_token()
    user_id = str(uuid.uuid4())
    
    data_store["users"][token] = {
        "id": user_id,
        "email": user.email,
        "token": token
    }
    
    return LoginResponse(
        access_token=token,
        user_id=user_id,
        email=user.email
    )

@app.post("/api/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    token = current_user["token"]
    if token in data_store["users"]:
        del data_store["users"][token]
    return {"message": "Logged out successfully"}

# Portfolio endpoints
@app.get("/api/portfolio", response_model=PortfolioData)
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    portfolio = {
        "total_value": 125000.00,
        "daily_pnl": 2500.00,
        "positions": [
            {"symbol": "RELIANCE", "quantity": 10, "avg_price": 2850.00, "current_price": 2875.00, "pnl": 250.00},
            {"symbol": "TCS", "quantity": 5, "avg_price": 3650.00, "current_price": 3625.00, "pnl": -125.00},
            {"symbol": "INFY", "quantity": 15, "avg_price": 1750.00, "current_price": 1765.00, "pnl": 225.00}
        ],
        "cash_balance": 50000.00
    }
    
    return PortfolioData(**portfolio)

# Market data endpoints
@app.get("/api/market/live")
async def get_live_market_data():
    symbols = ["RELIANCE", "TCS", "INFY", "HDFC", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK"]
    
    market_data = []
    for symbol in symbols:
        price = random.uniform(1500, 3000)
        change = random.uniform(-50, 50)
        change_percent = (change / price) * 100
        
        data = {
            "symbol": symbol,
            "price": round(price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "volume": random.randint(100000, 1000000),
            "timestamp": datetime.now().isoformat()
        }
        market_data.append(data)
    
    return {"data": market_data}

# Trading endpoints
@app.post("/api/orders/place")
async def place_order(order: Order, current_user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    
    order_data = {
        "order_id": order_id,
        "user_id": current_user["id"],
        "symbol": order.symbol,
        "side": order.side,
        "quantity": order.quantity,
        "price": order.price,
        "order_type": order.order_type,
        "status": "FILLED",
        "timestamp": datetime.now().isoformat()
    }
    
    data_store["orders"][order_id] = order_data
    data_store["trades"].append(order_data)
    
    await broadcast_to_websockets({
        "type": "order_update",
        "data": order_data
    })
    
    return {"order_id": order_id, "status": "success", "message": "Order placed successfully"}

@app.get("/api/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    user_orders = [order for order in data_store["orders"].values() 
                   if order["user_id"] == current_user["id"]]
    return {"orders": user_orders}

@app.get("/api/trades")
async def get_trades(current_user: dict = Depends(get_current_user)):
    user_trades = [trade for trade in data_store["trades"] 
                   if trade["user_id"] == current_user["id"]]
    return {"trades": user_trades}

# AI endpoints
@app.get("/api/ai/signals")
async def get_ai_signals():
    symbols = ["RELIANCE", "TCS", "INFY", "HDFC", "HDFCBANK"]
    signals = []
    
    for symbol in symbols:
        signals.append({
            "symbol": symbol,
            "signal": random.choice(["BUY", "SELL", "HOLD"]),
            "confidence": round(random.uniform(0.6, 0.95), 2),
            "timestamp": datetime.now().isoformat()
        })
    
    return {"signals": signals}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Send live market data every 2 seconds
            market_data = await get_live_market_data()
            await websocket.send_text(json.dumps({
                "type": "market_data",
                "data": market_data
            }))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        active_connections.remove(websocket)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
