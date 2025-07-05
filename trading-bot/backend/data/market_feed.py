import asyncio
import json
import logging
import time
from typing import Dict, List, Set
from datetime import datetime
import redis
from fastapi import WebSocket
from smartapi import SmartWebSocket

from config import REDIS_URL, ANGEL_API_KEY, ANGEL_CLIENT_ID
from broker.angel_one import angel_client

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.connections: List[WebSocket] = []
        self.subscribed_symbols: Set[str] = set()
        self.redis_client = redis.from_url(REDIS_URL)
        self.angel_websocket = None
        
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.connections)}")
        
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.connections:
            self.connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.connections)}")
    
    async def subscribe_symbols(self, websocket: WebSocket, symbols: List[str]):
        """Subscribe to symbols for real-time data"""
        for symbol in symbols:
            self.subscribed_symbols.add(symbol)
            
        # Update Angel One WebSocket subscription
        if self.angel_websocket:
            await self._update_angel_subscription()
            
        await self.send_personal_message(
            {"type": "subscription_update", "symbols": list(self.subscribed_symbols)},
            websocket
        )
    
    async def unsubscribe_symbols(self, websocket: WebSocket, symbols: List[str]):
        """Unsubscribe from symbols"""
        for symbol in symbols:
            self.subscribed_symbols.discard(symbol)
            
        # Update Angel One WebSocket subscription
        if self.angel_websocket:
            await self._update_angel_subscription()
            
        await self.send_personal_message(
            {"type": "subscription_update", "symbols": list(self.subscribed_symbols)},
            websocket
        )
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if self.connections:
            disconnected = []
            for connection in self.connections:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected.append(connection)
            
            # Remove disconnected clients
            for connection in disconnected:
                self.disconnect(connection)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific client"""
        try:
            await websocket.send_text(json.dumps(message))
        except:
            self.disconnect(websocket)
    
    async def _update_angel_subscription(self):
        """Update Angel One WebSocket subscription"""
        if not self.subscribed_symbols:
            return
            
        # Convert symbols to Angel One format
        instruments = []
        for symbol in self.subscribed_symbols:
            # For NSE stocks, format as NSE:SYMBOL-EQ
            if ":" not in symbol:
                instruments.append(f"NSE:{symbol}-EQ")
            else:
                instruments.append(symbol)
        
        try:
            if self.angel_websocket:
                # Subscribe to instruments
                self.angel_websocket.subscribe(
                    correlation_id="stream_1",
                    mode=self.angel_websocket.MODE_LTP,
                    token_list=instruments[:50]  # Angel One limit
                )
                logger.info(f"Subscribed to {len(instruments)} instruments")
        except Exception as e:
            logger.error(f"Angel One subscription failed: {e}")

class AngelWebSocketHandler:
    def __init__(self, websocket_manager: WebSocketManager):
        self.websocket_manager = websocket_manager
        self.redis_client = redis.from_url(REDIS_URL)
        
    def on_ticks(self, ws, ticks):
        """Handle incoming tick data from Angel One"""
        try:
            for tick in ticks:
                # Process tick data
                processed_tick = self._process_tick_data(tick)
                
                # Store in Redis for caching
                symbol = processed_tick.get('symbol')
                if symbol:
                    self.redis_client.setex(
                        f"live_data:{symbol}",
                        60,  # 1 minute expiry
                        json.dumps(processed_tick)
                    )
                
                # Broadcast to WebSocket clients
                asyncio.create_task(
                    self.websocket_manager.broadcast({
                        "type": "tick_data",
                        "data": processed_tick
                    })
                )
                
        except Exception as e:
            logger.error(f"Tick processing error: {e}")
    
    def on_connect(self, ws, response):
        """Handle WebSocket connection"""
        logger.info("Angel One WebSocket connected")
        
    def on_disconnect(self, ws, code, reason):
        """Handle WebSocket disconnection"""
        logger.warning(f"Angel One WebSocket disconnected: {code} - {reason}")
        
    def on_error(self, ws, code, reason):
        """Handle WebSocket error"""
        logger.error(f"Angel One WebSocket error: {code} - {reason}")
    
    def _process_tick_data(self, tick: dict) -> dict:
        """Process raw tick data into standardized format"""
        try:
            return {
                "symbol": tick.get('token'),  # You'll need to map token to symbol
                "ltp": tick.get('last_traded_price', 0),
                "volume": tick.get('volume_traded_today', 0),
                "open": tick.get('open_price_of_the_day', 0),
                "high": tick.get('high_price_of_the_day', 0),
                "low": tick.get('low_price_of_the_day', 0),
                "close": tick.get('closed_price', 0),
                "change": tick.get('change', 0),
                "change_percent": tick.get('change_percent', 0),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Tick data processing error: {e}")
            return {}

async def start_market_feed(websocket_manager: WebSocketManager):
    """Start the real-time market data feed"""
    try:
        # Get access token (you'll need to handle authentication)
        # For now, using a placeholder - in production, get from authenticated user
        access_token = angel_client.access_token
        
        if not access_token:
            logger.warning("No access token available for WebSocket feed")
            return
        
        # Initialize Angel One WebSocket
        handler = AngelWebSocketHandler(websocket_manager)
        
        sws = SmartWebSocket(
            auth_token=access_token,
            api_key=ANGEL_API_KEY,
            client_code=ANGEL_CLIENT_ID,
            feed_token=access_token  # Using access token as feed token
        )
        
        # Set event handlers
        sws.on_ticks = handler.on_ticks
        sws.on_connect = handler.on_connect
        sws.on_disconnect = handler.on_disconnect
        sws.on_error = handler.on_error
        
        # Store reference
        websocket_manager.angel_websocket = sws
        
        # Connect WebSocket
        sws.connect()
        
        logger.info("Market data feed started")
        
        # Keep the connection alive
        while True:
            await asyncio.sleep(1)
            
    except Exception as e:
        logger.error(f"Market feed startup error: {e}")
        # Retry after some time
        await asyncio.sleep(30)
        await start_market_feed(websocket_manager)

async def get_cached_data(symbol: str) -> dict:
    """Get cached market data for a symbol"""
    try:
        redis_client = redis.from_url(REDIS_URL)
        cached_data = redis_client.get(f"live_data:{symbol}")
        
        if cached_data:
            return json.loads(cached_data.decode('utf-8'))
        else:
            return None
            
    except Exception as e:
        logger.error(f"Cache retrieval error for {symbol}: {e}")
        return None

async def cache_market_data(symbol: str, data: dict, expiry: int = 60):
    """Cache market data in Redis"""
    try:
        redis_client = redis.from_url(REDIS_URL)
        redis_client.setex(
            f"live_data:{symbol}",
            expiry,
            json.dumps(data)
        )
    except Exception as e:
        logger.error(f"Cache storage error for {symbol}: {e}")
