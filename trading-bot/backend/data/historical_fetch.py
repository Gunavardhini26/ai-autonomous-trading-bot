import requests
import asyncio
import time
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import pandas as pd

from config import ALPHA_VANTAGE_API_KEY, ALPHA_VANTAGE_BASE_URL, ALPHA_VANTAGE_RATE_LIMIT

logger = logging.getLogger(__name__)

class AlphaVantageClient:
    def __init__(self):
        self.api_key = ALPHA_VANTAGE_API_KEY
        self.base_url = ALPHA_VANTAGE_BASE_URL
        self.last_request_time = 0
        self.daily_request_count = 0
        self.last_reset_date = datetime.now().date()
    
    async def rate_limit(self):
        """Enforce rate limiting for Alpha Vantage API (5 requests per minute)"""
        current_time = time.time()
        
        # Reset daily counter if new day
        if datetime.now().date() > self.last_reset_date:
            self.daily_request_count = 0
            self.last_reset_date = datetime.now().date()
        
        # Check daily limit
        if self.daily_request_count >= 500:
            logger.warning("Alpha Vantage daily limit reached")
            raise Exception("Daily API limit reached")
        
        # Enforce rate limit (5 requests per minute = 12 seconds between requests)
        time_since_last = current_time - self.last_request_time
        if time_since_last < (60 / ALPHA_VANTAGE_RATE_LIMIT):
            sleep_time = (60 / ALPHA_VANTAGE_RATE_LIMIT) - time_since_last
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
        self.daily_request_count += 1

    async def get_intraday_data(
        self, 
        symbol: str, 
        interval: str = "5min", 
        outputsize: str = "compact"
    ) -> Dict:
        """
        Get intraday time series data
        Intervals: 1min, 5min, 15min, 30min, 60min
        """
        await self.rate_limit()
        
        try:
            # Convert symbol to Alpha Vantage format for Indian stocks
            if ":" in symbol:
                symbol = symbol.split(":")[1]
            
            # For Indian stocks, append .BSE or use appropriate exchange
            if not "." in symbol:
                symbol = f"{symbol}.BSE"  # Default to BSE for Indian stocks
            
            params = {
                "function": "TIME_SERIES_INTRADAY",
                "symbol": symbol,
                "interval": interval,
                "outputsize": outputsize,
                "apikey": self.api_key
            }
            
            response = requests.get(self.base_url + "/query", params=params)
            data = response.json()
            
            if "Error Message" in data:
                return {"success": False, "error": data["Error Message"]}
            
            if "Note" in data:
                return {"success": False, "error": "API call frequency limit reached"}
            
            time_series_key = f"Time Series ({interval})"
            if time_series_key not in data:
                return {"success": False, "error": "No data available"}
            
            # Process data
            time_series = data[time_series_key]
            processed_data = []
            
            for timestamp, values in time_series.items():
                processed_data.append({
                    "timestamp": timestamp,
                    "open": float(values["1. open"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"]),
                    "close": float(values["4. close"]),
                    "volume": int(values["5. volume"])
                })
            
            # Sort by timestamp (newest first)
            processed_data.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return {
                "success": True,
                "symbol": symbol,
                "interval": interval,
                "data": processed_data,
                "metadata": data.get("Meta Data", {})
            }
            
        except Exception as e:
            logger.error(f"Alpha Vantage intraday data fetch failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

    async def get_daily_data(self, symbol: str, outputsize: str = "compact") -> Dict:
        """Get daily time series data"""
        await self.rate_limit()
        
        try:
            if ":" in symbol:
                symbol = symbol.split(":")[1]
            
            if not "." in symbol:
                symbol = f"{symbol}.BSE"
            
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "outputsize": outputsize,
                "apikey": self.api_key
            }
            
            response = requests.get(self.base_url + "/query", params=params)
            data = response.json()
            
            if "Error Message" in data:
                return {"success": False, "error": data["Error Message"]}
            
            if "Time Series (Daily)" not in data:
                return {"success": False, "error": "No data available"}
            
            # Process data
            time_series = data["Time Series (Daily)"]
            processed_data = []
            
            for date, values in time_series.items():
                processed_data.append({
                    "date": date,
                    "open": float(values["1. open"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"]),
                    "close": float(values["4. close"]),
                    "volume": int(values["5. volume"])
                })
            
            # Sort by date (newest first)
            processed_data.sort(key=lambda x: x["date"], reverse=True)
            
            return {
                "success": True,
                "symbol": symbol,
                "data": processed_data,
                "metadata": data.get("Meta Data", {})
            }
            
        except Exception as e:
            logger.error(f"Alpha Vantage daily data fetch failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

    async def get_technical_indicators(
        self, 
        symbol: str, 
        indicator: str, 
        interval: str = "daily",
        time_period: int = 14,
        **kwargs
    ) -> Dict:
        """
        Get technical indicators
        Available indicators: RSI, MACD, EMA, SMA, STOCH, ADX, etc.
        """
        await self.rate_limit()
        
        try:
            if ":" in symbol:
                symbol = symbol.split(":")[1]
            
            if not "." in symbol:
                symbol = f"{symbol}.BSE"
            
            params = {
                "function": indicator.upper(),
                "symbol": symbol,
                "interval": interval,
                "time_period": time_period,
                "apikey": self.api_key
            }
            
            # Add additional parameters for specific indicators
            if indicator.upper() == "MACD":
                params.update({
                    "fastperiod": kwargs.get("fastperiod", 12),
                    "slowperiod": kwargs.get("slowperiod", 26),
                    "signalperiod": kwargs.get("signalperiod", 9)
                })
            elif indicator.upper() == "STOCH":
                params.update({
                    "fastkperiod": kwargs.get("fastkperiod", 5),
                    "slowkperiod": kwargs.get("slowkperiod", 3),
                    "slowdperiod": kwargs.get("slowdperiod", 3)
                })
            
            response = requests.get(self.base_url + "/query", params=params)
            data = response.json()
            
            if "Error Message" in data:
                return {"success": False, "error": data["Error Message"]}
            
            # Find the technical analysis key
            tech_key = None
            for key in data.keys():
                if "Technical Analysis" in key:
                    tech_key = key
                    break
            
            if not tech_key:
                return {"success": False, "error": "No technical analysis data"}
            
            # Process data
            tech_data = data[tech_key]
            processed_data = []
            
            for timestamp, values in tech_data.items():
                processed_data.append({
                    "timestamp": timestamp,
                    **{k: float(v) for k, v in values.items()}
                })
            
            # Sort by timestamp (newest first)
            processed_data.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return {
                "success": True,
                "symbol": symbol,
                "indicator": indicator.upper(),
                "data": processed_data,
                "metadata": data.get("Meta Data", {})
            }
            
        except Exception as e:
            logger.error(f"Technical indicator fetch failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

    async def get_quote(self, symbol: str) -> Dict:
        """Get global quote (current price info)"""
        await self.rate_limit()
        
        try:
            if ":" in symbol:
                symbol = symbol.split(":")[1]
            
            if not "." in symbol:
                symbol = f"{symbol}.BSE"
            
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.api_key
            }
            
            response = requests.get(self.base_url + "/query", params=params)
            data = response.json()
            
            if "Error Message" in data:
                return {"success": False, "error": data["Error Message"]}
            
            if "Global Quote" not in data:
                return {"success": False, "error": "No quote data available"}
            
            quote = data["Global Quote"]
            
            return {
                "success": True,
                "symbol": quote.get("01. symbol"),
                "open": float(quote.get("02. open", 0)),
                "high": float(quote.get("03. high", 0)),
                "low": float(quote.get("04. low", 0)),
                "price": float(quote.get("05. price", 0)),
                "volume": int(quote.get("06. volume", 0)),
                "latest_trading_day": quote.get("07. latest trading day"),
                "previous_close": float(quote.get("08. previous close", 0)),
                "change": float(quote.get("09. change", 0)),
                "change_percent": quote.get("10. change percent", "0%").replace("%", "")
            }
            
        except Exception as e:
            logger.error(f"Alpha Vantage quote fetch failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

    async def get_multiple_indicators_batch(
        self, 
        symbol: str, 
        indicators: List[str],
        interval: str = "daily"
    ) -> Dict:
        """
        Get multiple technical indicators with proper rate limiting
        This will make multiple API calls with appropriate delays
        """
        results = {}
        
        for indicator in indicators:
            try:
                result = await self.get_technical_indicators(
                    symbol=symbol,
                    indicator=indicator,
                    interval=interval
                )
                results[indicator] = result
                
                # Small delay between requests for safety
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Failed to get {indicator} for {symbol}: {e}")
                results[indicator] = {"success": False, "error": str(e)}
        
        return results

# Global instance
alpha_vantage_client = AlphaVantageClient()
