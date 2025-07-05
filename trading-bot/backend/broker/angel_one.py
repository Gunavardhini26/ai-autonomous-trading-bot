import requests
import json
import time
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import pyotp
import redis
from smartapi import SmartConnect, SmartWebSocket
import logging

from config import (
    ANGEL_API_KEY, ANGEL_CLIENT_ID, ANGEL_SECRET_KEY, 
    ANGEL_BASE_URL, REDIS_URL, ANGEL_ONE_RATE_LIMIT
)

logger = logging.getLogger(__name__)

class AngelOneClient:
    def __init__(self):
        self.api_key = ANGEL_API_KEY
        self.client_id = ANGEL_CLIENT_ID
        self.secret_key = ANGEL_SECRET_KEY
        self.base_url = ANGEL_BASE_URL
        self.redis_client = redis.from_url(REDIS_URL)
        self.smart_api = None
        self.websocket = None
        self.access_token = None
        self.refresh_token = None
        self.last_request_time = 0
        
    async def rate_limit(self):
        """Enforce rate limiting for Angel One API"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < ANGEL_ONE_RATE_LIMIT:
            await asyncio.sleep(ANGEL_ONE_RATE_LIMIT - time_since_last)
        self.last_request_time = time.time()

    def generate_session(self, user_id: str, password: str, totp_key: str = None) -> Dict:
        """
        Generate session with Angel One SmartAPI
        For production, you'll need user's actual login credentials
        """
        try:
            # Initialize SmartConnect
            self.smart_api = SmartConnect(api_key=self.api_key)
            
            # Generate TOTP if provided
            totp = ""
            if totp_key:
                totp = pyotp.TOTP(totp_key).now()
            
            # Login
            data = self.smart_api.generateSession(user_id, password, totp)
            
            if data['status']:
                self.access_token = data['data']['jwtToken']
                self.refresh_token = data['data']['refreshToken']
                
                # Store tokens in Redis with expiry
                self.redis_client.setex(
                    f"angel_access_token:{user_id}", 
                    86400,  # 24 hours
                    self.access_token
                )
                self.redis_client.setex(
                    f"angel_refresh_token:{user_id}",
                    2592000,  # 30 days 
                    self.refresh_token
                )
                
                return {
                    "success": True,
                    "access_token": self.access_token,
                    "refresh_token": self.refresh_token,
                    "user_profile": data['data']
                }
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Angel One session generation failed: {e}")
            return {"success": False, "error": str(e)}

    def refresh_access_token(self, user_id: str) -> Dict:
        """Refresh access token using refresh token"""
        try:
            refresh_token = self.redis_client.get(f"angel_refresh_token:{user_id}")
            if not refresh_token:
                return {"success": False, "error": "No refresh token found"}
                
            refresh_token = refresh_token.decode('utf-8')
            
            data = self.smart_api.generateToken(refresh_token)
            
            if data['status']:
                self.access_token = data['data']['jwtToken']
                self.redis_client.setex(
                    f"angel_access_token:{user_id}",
                    86400,
                    self.access_token
                )
                return {"success": True, "access_token": self.access_token}
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            return {"success": False, "error": str(e)}

    async def get_ltp(self, exchange: str, symbol: str) -> Dict:
        """Get Last Traded Price for a symbol"""
        await self.rate_limit()
        
        try:
            if not self.smart_api:
                return {"success": False, "error": "Not authenticated"}
                
            data = self.smart_api.ltpData(exchange, symbol, symbol)
            
            if data['status']:
                return {
                    "success": True,
                    "data": {
                        "symbol": symbol,
                        "ltp": data['data']['ltp'],
                        "timestamp": datetime.now().isoformat()
                    }
                }
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"LTP fetch failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

    async def get_quote(self, exchange: str, symbol: str) -> Dict:
        """Get detailed quote for a symbol"""
        await self.rate_limit()
        
        try:
            data = self.smart_api.getMarketData(
                mode="QUOTE",
                exchangeTokens={exchange: [symbol]}
            )
            
            if data['status']:
                quote_data = data['data']['fetched'][0]
                return {
                    "success": True,
                    "data": {
                        "symbol": symbol,
                        "ltp": quote_data['ltp'],
                        "open": quote_data['open'],
                        "high": quote_data['high'],
                        "low": quote_data['low'],
                        "close": quote_data['close'],
                        "volume": quote_data['volume'],
                        "change": quote_data['change'],
                        "change_percent": quote_data['pChange'],
                        "timestamp": datetime.now().isoformat()
                    }
                }
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Quote fetch failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

    async def place_order(self, order_data: Dict) -> Dict:
        """Place a trade order"""
        await self.rate_limit()
        
        try:
            order_params = {
                "variety": order_data.get("variety", "NORMAL"),
                "tradingsymbol": order_data["symbol"],
                "symboltoken": order_data["token"],
                "transactiontype": order_data["transaction_type"],  # BUY/SELL
                "exchange": order_data["exchange"],
                "ordertype": order_data.get("order_type", "MARKET"),
                "producttype": order_data.get("product_type", "INTRADAY"),
                "duration": order_data.get("duration", "DAY"),
                "price": order_data.get("price", "0"),
                "squareoff": order_data.get("squareoff", "0"),
                "stoploss": order_data.get("stoploss", "0"),
                "quantity": str(order_data["quantity"])
            }
            
            data = self.smart_api.placeOrder(order_params)
            
            if data['status']:
                return {
                    "success": True,
                    "order_id": data['data']['orderid'],
                    "message": data['message']
                }
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Order placement failed: {e}")
            return {"success": False, "error": str(e)}

    async def modify_order(self, order_id: str, order_data: Dict) -> Dict:
        """Modify an existing order"""
        await self.rate_limit()
        
        try:
            modify_params = {
                "variety": order_data.get("variety", "NORMAL"),
                "orderid": order_id,
                "ordertype": order_data.get("order_type", "LIMIT"),
                "producttype": order_data.get("product_type", "INTRADAY"),
                "duration": order_data.get("duration", "DAY"),
                "price": order_data.get("price", "0"),
                "quantity": str(order_data["quantity"]),
                "tradingsymbol": order_data["symbol"],
                "symboltoken": order_data["token"],
                "exchange": order_data["exchange"]
            }
            
            data = self.smart_api.modifyOrder(modify_params)
            
            if data['status']:
                return {"success": True, "message": data['message']}
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Order modification failed: {e}")
            return {"success": False, "error": str(e)}

    async def cancel_order(self, order_id: str, variety: str = "NORMAL") -> Dict:
        """Cancel an order"""
        await self.rate_limit()
        
        try:
            data = self.smart_api.cancelOrder(order_id, variety)
            
            if data['status']:
                return {"success": True, "message": data['message']}
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Order cancellation failed: {e}")
            return {"success": False, "error": str(e)}

    async def get_order_book(self) -> Dict:
        """Get order book"""
        await self.rate_limit()
        
        try:
            data = self.smart_api.orderBook()
            
            if data['status']:
                return {"success": True, "data": data['data']}
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Order book fetch failed: {e}")
            return {"success": False, "error": str(e)}

    async def get_positions(self) -> Dict:
        """Get current positions"""
        await self.rate_limit()
        
        try:
            data = self.smart_api.position()
            
            if data['status']:
                return {"success": True, "data": data['data']}
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Positions fetch failed: {e}")
            return {"success": False, "error": str(e)}

    async def get_holdings(self) -> Dict:
        """Get holdings"""
        await self.rate_limit()
        
        try:
            data = self.smart_api.holding()
            
            if data['status']:
                return {"success": True, "data": data['data']}
            else:
                return {"success": False, "error": data['message']}
                
        except Exception as e:
            logger.error(f"Holdings fetch failed: {e}")
            return {"success": False, "error": str(e)}

    def get_instrument_list(self, exchange: str = "NSE") -> List[Dict]:
        """Get instrument master list"""
        try:
            # Download instrument file
            url = f"{self.base_url}/rest/secure/angelbroking/order/v1/getInstrumentList?exchange={exchange}"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-ClientLocalIP": "127.0.0.1",
                "X-ClientPublicIP": "127.0.0.1",
                "X-MACAddress": "fe80::216c:2f:8084:b2b8",
                "X-PrivateKey": self.api_key
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Instrument list fetch failed: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Instrument list fetch error: {e}")
            return []

# Global instance
angel_client = AngelOneClient()
