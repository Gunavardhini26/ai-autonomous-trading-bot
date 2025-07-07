from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import json
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Autonomous Trading Bot - Test Version",
    description="Testing core functionality",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple WebSocket connection list
active_connections: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Test WebSocket endpoint"""
    await websocket.accept()
    active_connections.append(websocket)
    logger.info("WebSocket connection established")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            logger.info(f"Received WebSocket message: {message}")
            
            # Echo back with processing status
            response = {
                "status": "processed",
                "data": message,
                "timestamp": asyncio.get_event_loop().time()
            }
            await websocket.send_text(json.dumps(response))
                
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info("WebSocket connection closed")

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("🚀 AI Trading Bot Test Server starting up...")
    logger.info("✅ Core components initialized")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Trading Bot Test",
        "version": "2.0.0",
        "components": {
            "core_api": "running",
            "websocket": "running",
            "database": "simulated",
            "ai_engine": "simulated"
        }
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🤖 AI Trading Bot Test API",
        "description": "Testing core functionality before full deployment",
        "test_endpoints": [
            "/health - Health check",
            "/api/test/portfolio - Simulated portfolio data",
            "/api/test/signals - Simulated AI signals",
            "/docs - API documentation",
            "/ws - WebSocket endpoint"
        ]
    }

@app.get("/api/test/portfolio")
async def test_portfolio():
    """Test portfolio endpoint with simulated data"""
    return {
        "portfolio": {
            "totalValue": 1500000.50,
            "totalPnL": 75000.25,
            "totalPnLPercent": 5.26,
            "dailyPnL": 12500.75,
            "positions": [
                {"symbol": "RELIANCE", "quantity": 100, "current_price": 2450.50, "pnl": 5000.25},
                {"symbol": "TCS", "quantity": 50, "current_price": 3200.75, "pnl": 8500.50},
                {"symbol": "HDFC", "quantity": 75, "current_price": 1650.25, "pnl": -2500.75}
            ]
        },
        "status": "simulated_data",
        "message": "Portfolio simulation working correctly"
    }

@app.get("/api/test/signals")
async def test_signals():
    """Test AI signals endpoint with simulated data"""
    return {
        "ai_signals": [
            {
                "symbol": "RELIANCE",
                "signal_type": "BUY",
                "confidence": 0.85,
                "target_price": 2500.00,
                "stop_loss": 2400.00,
                "timestamp": "2025-07-07T12:00:00Z"
            },
            {
                "symbol": "TCS", 
                "signal_type": "HOLD",
                "confidence": 0.72,
                "target_price": 3300.00,
                "stop_loss": 3100.00,
                "timestamp": "2025-07-07T12:00:00Z"
            },
            {
                "symbol": "HDFC",
                "signal_type": "SELL", 
                "confidence": 0.78,
                "target_price": 1600.00,
                "stop_loss": 1700.00,
                "timestamp": "2025-07-07T12:00:00Z"
            }
        ],
        "status": "simulated_data",
        "message": "AI signals simulation working correctly"
    }

@app.get("/api/test/risk")
async def test_risk():
    """Test risk metrics endpoint with simulated data"""
    return {
        "risk": {
            "portfolioRisk": 15.25,
            "var95": -45000.75,
            "maxDrawdown": 8.50,
            "sharpeRatio": 2.18,
            "volatility": 18.50
        },
        "status": "simulated_data", 
        "message": "Risk management simulation working correctly"
    }

@app.get("/api/analytics/dashboard")
async def test_dashboard():
    """Test dashboard analytics endpoint"""
    portfolio_data = await test_portfolio()
    signals_data = await test_signals()
    risk_data = await test_risk()
    
    return {
        "portfolio": portfolio_data["portfolio"],
        "risk": risk_data["risk"],
        "ai_signals": signals_data["ai_signals"],
        "timestamp": asyncio.get_event_loop().time(),
        "status": "test_mode",
        "message": "Dashboard data simulation working correctly"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_test:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
