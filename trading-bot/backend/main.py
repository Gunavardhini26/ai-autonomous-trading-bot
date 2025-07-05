from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import json
from typing import List

from db.database import engine, Base
from db import models
from routers import auth, market, trading, ai_engine, news, settings
from data.market_feed import WebSocketManager, start_market_feed
from security.auth import get_current_user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Autonomous Trading Bot",
    description="Lightning-fast AI-powered trading platform for Indian stock market",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(trading.router, prefix="/api/trading", tags=["Trading"])
app.include_router(ai_engine.router, prefix="/api/ai", tags=["AI Engine"])
app.include_router(news.router, prefix="/api/news", tags=["News & Sentiment"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

# WebSocket Manager
websocket_manager = WebSocketManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                # Handle symbol subscription
                symbols = message.get("symbols", [])
                await websocket_manager.subscribe_symbols(websocket, symbols)
                
            elif message.get("type") == "unsubscribe":
                # Handle symbol unsubscription
                symbols = message.get("symbols", [])
                await websocket_manager.unsubscribe_symbols(websocket, symbols)
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    """Start background tasks when the application starts"""
    # Start market data feed
    asyncio.create_task(start_market_feed(websocket_manager))

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Trading Bot Backend",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "AI Autonomous Trading Bot API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
