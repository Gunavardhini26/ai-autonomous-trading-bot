#!/usr/bin/env python3
"""
Ultra-Fast Trading Bot Backend
High-performance, minimal dependencies, optimized for speed
"""
import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime
import logging

# Optimize imports
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging for performance
logging.basicConfig(level=logging.WARNING)

try:
    from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from fastapi.staticfiles import StaticFiles
    import uvicorn
    
    # Ultra-fast app configuration
    app = FastAPI(
        title="AI Trading Bot Ultra",
        version="2.0.0",
        debug=False,
        docs_url=None,  # Disable docs for performance
        redoc_url=None
    )
    
    # CORS optimized for performance
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
    
    # In-memory cache for ultra-fast responses
    cache = {
        "market_data": [],
        "portfolio": {},
        "watchlist": [],
        "trades": [],
        "last_update": datetime.now().isoformat()
    }
    
    # WebSocket connections manager
    class ConnectionManager:
        def __init__(self):
            self.active_connections: list[WebSocket] = []
        
        async def connect(self, websocket: WebSocket):
            await websocket.accept()
            self.active_connections.append(websocket)
        
        def disconnect(self, websocket: WebSocket):
            self.active_connections.remove(websocket)
        
        async def send_personal_message(self, message: str, websocket: WebSocket):
            await websocket.send_text(message)
        
        async def broadcast(self, message: str):
            for connection in self.active_connections:
                try:
                    await connection.send_text(message)
                except:
                    pass
    
    manager = ConnectionManager()
    
    # Ultra-fast API endpoints
    @app.get("/")
    async def root():
        return {"status": "ultra-fast", "version": "2.0.0", "timestamp": datetime.now().isoformat()}
    
    @app.get("/api/health")
    async def health():
        return {"status": "healthy", "uptime": "active"}
    
    @app.get("/api/market-data")
    async def get_market_data():
        # Simulated real-time market data
        market_data = [
            {"symbol": "RELIANCE", "price": 2847.50, "change": "+1.2%", "volume": "2.1M"},
            {"symbol": "TCS", "price": 3421.75, "change": "+0.8%", "volume": "1.8M"},
            {"symbol": "INFY", "price": 1567.30, "change": "-0.3%", "volume": "3.2M"},
            {"symbol": "HDFCBANK", "price": 1642.80, "change": "+2.1%", "volume": "4.1M"},
            {"symbol": "ICICIBANK", "price": 987.25, "change": "+1.5%", "volume": "2.9M"}
        ]
        cache["market_data"] = market_data
        cache["last_update"] = datetime.now().isoformat()
        return {"data": market_data, "timestamp": cache["last_update"]}
    
    @app.get("/api/portfolio")
    async def get_portfolio():
        portfolio = {
            "total_value": 125000.50,
            "day_change": "+2.3%",
            "day_pnl": "+2850.75",
            "holdings": [
                {"symbol": "RELIANCE", "qty": 50, "avg_price": 2800.00, "current_price": 2847.50, "pnl": "+2375.00"},
                {"symbol": "TCS", "qty": 25, "avg_price": 3400.00, "current_price": 3421.75, "pnl": "+543.75"}
            ]
        }
        cache["portfolio"] = portfolio
        return portfolio
    
    @app.get("/api/watchlist")
    async def get_watchlist():
        watchlist = [
            {"symbol": "NIFTY", "price": 18456.75, "change": "+1.1%"},
            {"symbol": "BANKNIFTY", "price": 42318.50, "change": "+1.8%"},
            {"symbol": "SENSEX", "price": 61234.25, "change": "+0.9%"}
        ]
        cache["watchlist"] = watchlist
        return {"watchlist": watchlist}
    
    @app.get("/api/orders")
    async def get_orders():
        orders = [
            {"id": "ORD001", "symbol": "RELIANCE", "side": "BUY", "qty": 10, "price": 2850.00, "status": "PENDING"},
            {"id": "ORD002", "symbol": "TCS", "side": "SELL", "qty": 5, "price": 3420.00, "status": "EXECUTED"}
        ]
        return {"orders": orders}
    
    @app.post("/api/place-order")
    async def place_order(order_data: dict):
        # Simulate order placement
        order_id = f"ORD{len(cache.get('trades', [])) + 1:03d}"
        order = {
            "id": order_id,
            "symbol": order_data.get("symbol"),
            "side": order_data.get("side"),
            "qty": order_data.get("quantity"),
            "price": order_data.get("price"),
            "status": "PENDING",
            "timestamp": datetime.now().isoformat()
        }
        cache.setdefault("trades", []).append(order)
        return {"success": True, "order_id": order_id, "order": order}
    
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await manager.connect(websocket)
        try:
            while True:
                # Send real-time updates every 2 seconds
                await asyncio.sleep(2)
                update = {
                    "type": "market_update",
                    "data": cache.get("market_data", []),
                    "timestamp": datetime.now().isoformat()
                }
                await manager.send_personal_message(json.dumps(update), websocket)
        except WebSocketDisconnect:
            manager.disconnect(websocket)
    
    # Background task for market data updates
    async def update_market_data():
        while True:
            await asyncio.sleep(1)  # Update every second
            # Simulate price changes
            for item in cache.get("market_data", []):
                import random
                change = random.uniform(-0.5, 0.5)
                item["price"] = round(item["price"] + change, 2)
            
            # Broadcast to all connected clients
            if manager.active_connections:
                await manager.broadcast(json.dumps({
                    "type": "price_update",
                    "data": cache.get("market_data", []),
                    "timestamp": datetime.now().isoformat()
                }))
    
    @app.on_event("startup")
    async def startup_event():
        # Start background tasks
        asyncio.create_task(update_market_data())
        print("🚀 Ultra-Fast Trading Bot Backend Started!")
        print("📊 Real-time market data streaming active")
        print("🔌 WebSocket connections ready")
    
    if __name__ == "__main__":
        print("🚀 Starting Ultra-Fast Trading Bot Backend...")
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000, 
            log_level="warning",  # Minimal logging for performance
            access_log=False,     # Disable access logs for speed
            workers=1
        )
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Installing minimal required packages...")
    os.system("pip install fastapi uvicorn websockets")
    print("✅ Packages installed, please run again")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
