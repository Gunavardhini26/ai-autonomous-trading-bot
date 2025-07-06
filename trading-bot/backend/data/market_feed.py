"""
Advanced Real-time Market Data Feed System
Supports multiple data sources, real-time streaming, and intelligent data fusion
"""

import asyncio
import websockets
import json
import aiohttp
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import redis.asyncio as redis
import yfinance as yf
import ccxt.async_support as ccxt
from concurrent.futures import ThreadPoolExecutor
import time
import threading
from collections import defaultdict, deque
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class DataSource(Enum):
    YAHOO = "yahoo"
    BINANCE = "binance"
    ALPHA_VANTAGE = "alpha_vantage"
    POLYGON = "polygon"
    IEX = "iex"
    WEBSOCKET = "websocket"

class DataQuality(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    STALE = "stale"

@dataclass
class MarketTick:
    """Real-time market tick data"""
    symbol: str
    timestamp: datetime
    price: float
    volume: float
    bid: Optional[float] = None
    ask: Optional[float] = None
    bid_size: Optional[float] = None
    ask_size: Optional[float] = None
    source: DataSource = DataSource.YAHOO
    quality: DataQuality = DataQuality.MEDIUM
    latency_ms: Optional[float] = None

@dataclass
class MarketBar:
    """OHLCV bar data"""
    symbol: str
    timestamp: datetime
    timeframe: str  # 1m, 5m, 1h, 1d, etc.
    open: float
    high: float
    low: float
    close: float
    volume: float
    vwap: Optional[float] = None
    trades_count: Optional[int] = None
    source: DataSource = DataSource.YAHOO
    quality: DataQuality = DataQuality.MEDIUM

class AdvancedMarketDataFeed:
    """Advanced market data feed with multiple sources and real-time capabilities"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = None
        self.redis_url = redis_url
        self.subscribers = defaultdict(list)
        self.data_cache = defaultdict(lambda: deque(maxlen=1000))
        self.data_sources = {}
        self.websocket_connections = {}
        self.is_running = False
        self.executor = ThreadPoolExecutor(max_workers=10)
        
        # Data quality tracking
        self.source_quality = defaultdict(lambda: DataQuality.MEDIUM)
        self.source_latency = defaultdict(list)
        self.last_update_time = defaultdict(datetime)
        
    async def initialize(self):
        """Initialize data feed system"""
        try:
            # Initialize Redis connection
            self.redis_client = redis.Redis.from_url(self.redis_url, decode_responses=True)
            await self.redis_client.ping()
            
            # Initialize data sources
            await self._initialize_data_sources()
            
            self.is_running = True
            logger.info("Advanced market data feed initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize market data feed: {e}")
            
    async def _initialize_data_sources(self):
        """Initialize various data sources"""
        
        # Yahoo Finance (free, good for stocks)
        self.data_sources[DataSource.YAHOO] = {
            'client': None,  # YFinance doesn't need client initialization
            'symbols': set(),
            'rate_limit': 2000,
            'last_request': {}
        }
        
    async def subscribe_symbol(self, symbol: str, callback: Callable, data_types: List[str] = None):
        """Subscribe to real-time data for a symbol"""
        
        if data_types is None:
            data_types = ['tick', 'bar_1m', 'bar_5m']
            
        for data_type in data_types:
            key = f"{symbol}:{data_type}"
            self.subscribers[key].append(callback)
            
        # Start data collection for this symbol
        await self._start_symbol_collection(symbol)
        
        logger.info(f"Subscribed to {symbol} for data types: {data_types}")
        
    async def _start_symbol_collection(self, symbol: str):
        """Start collecting data for a symbol from all available sources"""
        
        # Use Yahoo Finance for now
        asyncio.create_task(self._collect_yahoo_data(symbol))
            
    async def _collect_yahoo_data(self, symbol: str):
        """Collect data from Yahoo Finance"""
        
        while self.is_running:
            try:
                # Get current data
                ticker = yf.Ticker(symbol)
                
                # Get current price (using history for real-time-ish data)
                hist = ticker.history(period='1d', interval='1m')
                
                if not hist.empty:
                    latest = hist.iloc[-1]
                    
                    # Create market tick
                    tick = MarketTick(
                        symbol=symbol,
                        timestamp=datetime.now(),
                        price=float(latest['Close']),
                        volume=float(latest['Volume']),
                        source=DataSource.YAHOO,
                        quality=self.source_quality[DataSource.YAHOO]
                    )
                    
                    await self._process_market_data(tick)
                    
                    # Create 1-minute bar
                    bar = MarketBar(
                        symbol=symbol,
                        timestamp=latest.name.to_pydatetime() if hasattr(latest.name, 'to_pydatetime') else datetime.now(),
                        timeframe='1m',
                        open=float(latest['Open']),
                        high=float(latest['High']),
                        low=float(latest['Low']),
                        close=float(latest['Close']),
                        volume=float(latest['Volume']),
                        source=DataSource.YAHOO,
                        quality=self.source_quality[DataSource.YAHOO]
                    )
                    
                    await self._process_market_data(bar)
                    
                # Wait before next collection
                await asyncio.sleep(60)  # 1 minute interval
                
            except Exception as e:
                logger.error(f"Yahoo data collection error for {symbol}: {e}")
                await asyncio.sleep(60)  # Wait on error
                
    async def _process_market_data(self, data: Any):
        """Process and distribute market data to subscribers"""
        
        try:
            # Cache data
            cache_key = f"{data.symbol}:{type(data).__name__.lower()}"
            self.data_cache[cache_key].append(data)
            
            # Store in Redis
            if self.redis_client:
                await self.redis_client.set(
                    f"market_data:{cache_key}:latest",
                    json.dumps(asdict(data), default=str),
                    ex=300  # 5 minute expiry
                )
                
            # Notify subscribers
            data_type = type(data).__name__.lower()
            if hasattr(data, 'timeframe') and data.timeframe:
                data_type = f"bar_{data.timeframe}"
            else:
                data_type = 'tick'
                
            subscriber_key = f"{data.symbol}:{data_type}"
            
            for callback in self.subscribers[subscriber_key]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(data)
                    else:
                        callback(data)
                except Exception as e:
                    logger.error(f"Subscriber callback error: {e}")
                    
        except Exception as e:
            logger.error(f"Error processing market data: {e}")
            
    async def get_historical_data(
        self,
        symbol: str,
        timeframe: str = '1d',
        period: str = '1y'
    ) -> pd.DataFrame:
        """Get historical data for a symbol"""
        
        try:
            def fetch_data():
                ticker = yf.Ticker(symbol)
                
                # Map timeframes
                interval_map = {
                    '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
                    '1h': '1h', '1d': '1d', '1w': '1wk', '1M': '1mo'
                }
                
                interval = interval_map.get(timeframe, '1d')
                hist = ticker.history(period=period, interval=interval)
                
                # Standardize column names
                if not hist.empty:
                    hist.columns = [col.lower() for col in hist.columns]
                    hist.reset_index(inplace=True)
                    
                    # Ensure we have the required columns
                    required_columns = ['open', 'high', 'low', 'close', 'volume']
                    for col in required_columns:
                        if col not in hist.columns:
                            hist[col] = 0.0
                            
                return hist
                
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(self.executor, fetch_data)
            
            return data
            
        except Exception as e:
            logger.error(f"Error getting historical data: {e}")
            return pd.DataFrame()
            
    async def get_real_time_data(self, symbol: str, data_type: str = 'tick') -> Optional[Any]:
        """Get latest real-time data for a symbol"""
        
        cache_key = f"{symbol}:{data_type}"
        
        if cache_key in self.data_cache and self.data_cache[cache_key]:
            return self.data_cache[cache_key][-1]
            
        # Try to get from Redis
        if self.redis_client:
            try:
                data_json = await self.redis_client.get(f"market_data:{cache_key}:latest")
                if data_json:
                    return json.loads(data_json)
            except Exception as e:
                logger.error(f"Redis retrieval error: {e}")
                
        return None
        
    async def cleanup(self):
        """Clean up resources"""
        
        self.is_running = False
        
        # Close Redis connection
        if self.redis_client:
            await self.redis_client.close()
            
        # Shutdown thread pool
        self.executor.shutdown(wait=True)
        
        logger.info("Market data feed cleaned up")

# WebSocket Manager for client connections
class WebSocketManager:
    """Manage WebSocket connections to clients"""
    
    def __init__(self):
        self.connections = set()
        self.market_feed = None
        
    async def connect(self, websocket):
        """Add new WebSocket connection"""
        self.connections.add(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self.connections)}")
        
    async def disconnect(self, websocket):
        """Remove WebSocket connection"""
        self.connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(self.connections)}")
        
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if self.connections:
            disconnected = set()
            for websocket in self.connections:
                try:
                    await websocket.send(json.dumps(message, default=str))
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")
                    disconnected.add(websocket)
                    
            # Remove disconnected clients
            self.connections -= disconnected

# Global instances
market_feed = AdvancedMarketDataFeed()
websocket_manager = WebSocketManager()

async def start_market_feed():
    """Start the market data feed system"""
    await market_feed.initialize()
    logger.info("Market data feed system started")

async def get_cached_data(symbol: str, data_type: str = 'tick'):
    """Get cached market data for a symbol"""
    return await market_feed.get_real_time_data(symbol, data_type)
