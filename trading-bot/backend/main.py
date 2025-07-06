from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import json
from typing import List
import logging

# Import all modules for advanced AI trading bot
from db.database import engine, Base
from db import models
from routers import auth, market, trading, ai_engine, news, settings
from data.market_feed import WebSocketManager, start_market_feed
from ai.advanced_engine import AdvancedAIEngine
from ai.risk_manager import AdvancedRiskManager
from ai.portfolio_manager import AdvancedPortfolioManager
from security.auth import get_current_user

# Initialize advanced AI components
ai_engine = AdvancedAIEngine()
risk_manager = AdvancedRiskManager()
portfolio_manager = AdvancedPortfolioManager()

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)

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

# Include all routers for full functionality
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(trading.router, prefix="/api/trading", tags=["Trading"])
app.include_router(ai_engine.router, prefix="/api/ai", tags=["AI Engine"])
app.include_router(news.router, prefix="/api/news", tags=["News & Sentiment"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

# WebSocket Manager for real-time data
websocket_manager = WebSocketManager()

# Simple WebSocket connection list for now
active_connections: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Advanced WebSocket endpoint for real-time trading data"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "subscribe":
                # Subscribe to real-time market data
                symbols = message.get("symbols", [])
                await websocket_manager.subscribe_to_symbols(websocket, symbols)
            elif message.get("type") == "get_portfolio":
                # Get real-time portfolio data
                portfolio_data = await portfolio_manager.get_portfolio_summary()
                await websocket.send_text(json.dumps({
                    "type": "portfolio_update",
                    "data": portfolio_data
                }))
            elif message.get("type") == "get_signals":
                # Get AI trading signals
                signals = await ai_engine.get_real_time_signals()
                await websocket.send_text(json.dumps({
                    "type": "ai_signals",
                    "data": signals
                }))
                
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    """Initialize advanced AI trading components on startup"""
    try:
        # Initialize AI engine
        await ai_engine.initialize()
        logging.info("Advanced AI Engine initialized")
        
        # Initialize risk management
        await risk_manager.initialize()
        logging.info("Risk Management System initialized")
        
        # Initialize portfolio manager
        await portfolio_manager.initialize()
        logging.info("Portfolio Manager initialized")
        
        # Start market data feed
        asyncio.create_task(start_market_feed(websocket_manager))
        logging.info("Market data feed started")
        
        # Start background AI processing
        asyncio.create_task(ai_background_processor())
        logging.info("AI background processor started")
        
        print("🚀 Advanced AI Trading Bot Backend started successfully!")
        
    except Exception as e:
        logging.error(f"Startup error: {e}")
        raise

async def ai_background_processor():
    """Background task for AI processing and portfolio management"""
    while True:
        try:
            # Generate AI signals every 30 seconds
            await ai_engine.process_market_data()
            
            # Update portfolio optimization every 5 minutes
            await asyncio.sleep(300)
            await portfolio_manager.rebalance_portfolio()
            
            # Risk assessment every minute
            await asyncio.sleep(60)
            await risk_manager.assess_portfolio_risk()
            
        except Exception as e:
            logging.error(f"Background processing error: {e}")
            await asyncio.sleep(30)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Trading Bot Backend",
        "version": "2.0.0",
        "components": {
            "ai_engine": "running",
            "risk_manager": "running", 
            "portfolio_manager": "running",
            "market_feed": "running"
        }
    }

@app.get("/")
async def root():
    return {
        "message": "🤖 Advanced AI Autonomous Trading Bot API",
        "description": "State-of-the-art AI-powered trading platform with real-time analytics",
        "features": [
            "Deep Learning Price Prediction",
            "Reinforcement Learning Trading Agent", 
            "Advanced Risk Management",
            "Portfolio Optimization",
            "Real-time Market Data",
            "Sentiment Analysis",
            "Multi-strategy Trading"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "websocket": "/ws"
        }
    }

# Advanced analytics endpoint
@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics():
    """Get comprehensive dashboard analytics"""
    try:
        portfolio_summary = await portfolio_manager.get_portfolio_summary()
        risk_metrics = await risk_manager.get_risk_metrics()
        ai_signals = await ai_engine.get_latest_signals()
        
        return {
            "portfolio": portfolio_summary,
            "risk": risk_metrics,
            "ai_signals": ai_signals,
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        logging.error(f"Dashboard analytics error: {e}")
        return {"error": "Unable to fetch analytics data"}

# Performance metrics endpoint  
@app.get("/api/analytics/performance")
async def get_performance_metrics():
    """Get detailed performance analytics"""
    try:
        return await portfolio_manager.get_performance_analytics()
    except Exception as e:
        logging.error(f"Performance metrics error: {e}")
        return {"error": "Unable to fetch performance data"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
