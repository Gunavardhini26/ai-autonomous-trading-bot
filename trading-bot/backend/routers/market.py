from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from db.database import get_db
from db.models import User, MarketData, TechnicalIndicator
from security.auth import get_current_user
from broker.angel_one import angel_client
from data.historical_fetch import alpha_vantage_client
from data.market_feed import get_cached_data
import asyncio

router = APIRouter()

# Pydantic models
class MarketQuote(BaseModel):
    symbol: str
    ltp: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None
    volume: Optional[int] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None
    timestamp: str

class TechnicalIndicators(BaseModel):
    symbol: str
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    ema_20: Optional[float] = None
    ema_50: Optional[float] = None
    vwap: Optional[float] = None
    timestamp: str

class HistoricalDataRequest(BaseModel):
    symbol: str
    interval: str = "5min"  # 1min, 5min, 15min, 30min, 60min, daily
    outputsize: str = "compact"

class MultiSymbolRequest(BaseModel):
    symbols: List[str]

@router.get("/quote/{symbol}", response_model=MarketQuote)
async def get_market_quote(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get real-time market quote for a symbol"""
    try:
        # First try to get cached data
        cached_data = await get_cached_data(symbol)
        if cached_data:
            return MarketQuote(
                symbol=symbol,
                ltp=cached_data.get("ltp"),
                open=cached_data.get("open"),
                high=cached_data.get("high"),
                low=cached_data.get("low"),
                close=cached_data.get("close"),
                volume=cached_data.get("volume"),
                change=cached_data.get("change"),
                change_percent=cached_data.get("change_percent"),
                timestamp=cached_data.get("timestamp", datetime.now().isoformat())
            )
        
        # If no cached data, try Angel One API
        angel_result = await angel_client.get_quote("NSE", symbol)
        if angel_result.get("success"):
            data = angel_result["data"]
            return MarketQuote(
                symbol=symbol,
                ltp=data.get("ltp"),
                open=data.get("open"),
                high=data.get("high"),
                low=data.get("low"),
                close=data.get("close"),
                volume=data.get("volume"),
                change=data.get("change"),
                change_percent=data.get("change_percent"),
                timestamp=data.get("timestamp", datetime.now().isoformat())
            )
        
        # Fallback to Alpha Vantage
        av_result = await alpha_vantage_client.get_quote(symbol)
        if av_result.get("success"):
            return MarketQuote(
                symbol=symbol,
                ltp=av_result.get("price"),
                open=av_result.get("open"),
                high=av_result.get("high"),
                low=av_result.get("low"),
                close=av_result.get("previous_close"),
                volume=av_result.get("volume"),
                change=av_result.get("change"),
                change_percent=float(av_result.get("change_percent", "0").replace("%", "")),
                timestamp=datetime.now().isoformat()
            )
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market data not available for symbol {symbol}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch market quote: {str(e)}"
        )

@router.post("/quotes", response_model=List[MarketQuote])
async def get_multiple_quotes(
    request: MultiSymbolRequest,
    current_user: User = Depends(get_current_user)
):
    """Get market quotes for multiple symbols"""
    try:
        quotes = []
        
        # Process symbols in batches to respect rate limits
        for symbol in request.symbols:
            try:
                quote_data = await get_market_quote(symbol, current_user)
                quotes.append(quote_data)
                
                # Small delay between requests
                await asyncio.sleep(0.1)
                
            except Exception as e:
                # Add error quote if individual symbol fails
                quotes.append(MarketQuote(
                    symbol=symbol,
                    timestamp=datetime.now().isoformat()
                ))
        
        return quotes
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch multiple quotes: {str(e)}"
        )

@router.get("/historical/{symbol}")
async def get_historical_data(
    symbol: str,
    interval: str = "5min",
    outputsize: str = "compact",
    current_user: User = Depends(get_current_user)
):
    """Get historical market data"""
    try:
        if interval == "daily":
            result = await alpha_vantage_client.get_daily_data(symbol, outputsize)
        else:
            result = await alpha_vantage_client.get_intraday_data(symbol, interval, outputsize)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("error", "Historical data not available")
            )
        
        return {
            "symbol": symbol,
            "interval": interval,
            "data": result["data"],
            "metadata": result.get("metadata", {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch historical data: {str(e)}"
        )

@router.get("/indicators/{symbol}", response_model=Dict)
async def get_technical_indicators(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get technical indicators for a symbol"""
    try:
        # Get multiple indicators
        indicators = ["RSI", "MACD", "EMA", "SMA"]
        results = {}
        
        for indicator in indicators:
            try:
                if indicator == "EMA":
                    # Get both EMA 20 and EMA 50
                    ema_20 = await alpha_vantage_client.get_technical_indicators(
                        symbol, "EMA", time_period=20
                    )
                    ema_50 = await alpha_vantage_client.get_technical_indicators(
                        symbol, "EMA", time_period=50
                    )
                    results["EMA_20"] = ema_20
                    results["EMA_50"] = ema_50
                else:
                    result = await alpha_vantage_client.get_technical_indicators(
                        symbol, indicator
                    )
                    results[indicator] = result
                
                # Respect rate limits
                await asyncio.sleep(12)  # 5 requests per minute = 12 seconds apart
                
            except Exception as e:
                results[indicator] = {"success": False, "error": str(e)}
        
        # Process results to extract latest values
        processed_indicators = {
            "symbol": symbol,
            "rsi": None,
            "macd": None,
            "macd_signal": None,
            "ema_20": None,
            "ema_50": None,
            "sma": None,
            "timestamp": datetime.now().isoformat()
        }
        
        # Extract RSI
        if results.get("RSI", {}).get("success"):
            rsi_data = results["RSI"]["data"]
            if rsi_data:
                processed_indicators["rsi"] = rsi_data[0].get("RSI")
        
        # Extract MACD
        if results.get("MACD", {}).get("success"):
            macd_data = results["MACD"]["data"]
            if macd_data:
                processed_indicators["macd"] = macd_data[0].get("MACD")
                processed_indicators["macd_signal"] = macd_data[0].get("MACD_Signal")
        
        # Extract EMAs
        if results.get("EMA_20", {}).get("success"):
            ema_20_data = results["EMA_20"]["data"]
            if ema_20_data:
                processed_indicators["ema_20"] = ema_20_data[0].get("EMA")
        
        if results.get("EMA_50", {}).get("success"):
            ema_50_data = results["EMA_50"]["data"]
            if ema_50_data:
                processed_indicators["ema_50"] = ema_50_data[0].get("EMA")
        
        # Extract SMA
        if results.get("SMA", {}).get("success"):
            sma_data = results["SMA"]["data"]
            if sma_data:
                processed_indicators["sma"] = sma_data[0].get("SMA")
        
        return {
            "indicators": processed_indicators,
            "raw_data": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch technical indicators: {str(e)}"
        )

@router.get("/watchlist")
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's watchlist with real-time data"""
    try:
        # Default Indian stock symbols for demonstration
        # In production, this would come from user's saved watchlist
        default_symbols = [
            "RELIANCE", "TCS", "INFY", "HDFC", "ICICI",
            "SBIN", "BHARTIARTL", "KOTAKBANK", "LT", "HCLTECH"
        ]
        
        watchlist_data = []
        
        for symbol in default_symbols:
            try:
                # Get basic quote
                cached_data = await get_cached_data(symbol)
                
                if cached_data:
                    watchlist_data.append({
                        "symbol": symbol,
                        "ltp": cached_data.get("ltp"),
                        "change": cached_data.get("change"),
                        "change_percent": cached_data.get("change_percent"),
                        "volume": cached_data.get("volume"),
                        "timestamp": cached_data.get("timestamp")
                    })
                else:
                    # Fallback data
                    watchlist_data.append({
                        "symbol": symbol,
                        "ltp": None,
                        "change": None,
                        "change_percent": None,
                        "volume": None,
                        "timestamp": datetime.now().isoformat()
                    })
                
            except Exception as e:
                # Skip failed symbols
                continue
        
        return {
            "watchlist": watchlist_data,
            "total_symbols": len(watchlist_data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch watchlist: {str(e)}"
        )

@router.get("/market-status")
async def get_market_status(current_user: User = Depends(get_current_user)):
    """Get current market status"""
    try:
        # Check current time to determine market status
        now = datetime.now()
        
        # Indian market hours: 9:15 AM to 3:30 PM (IST)
        market_open_time = now.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close_time = now.replace(hour=15, minute=30, second=0, microsecond=0)
        
        is_market_open = False
        if market_open_time <= now <= market_close_time:
            # Also check if it's a weekday
            if now.weekday() < 5:  # Monday = 0, Sunday = 6
                is_market_open = True
        
        # Calculate time to next market open/close
        if is_market_open:
            time_to_close = market_close_time - now
            next_event = "market_close"
            time_to_event = str(time_to_close)
        else:
            if now > market_close_time:
                # Market closed for the day, next open is tomorrow
                next_open = (now + timedelta(days=1)).replace(hour=9, minute=15, second=0, microsecond=0)
            else:
                # Before market open
                next_open = market_open_time
            
            time_to_open = next_open - now
            next_event = "market_open"
            time_to_event = str(time_to_open)
        
        return {
            "is_market_open": is_market_open,
            "market_open_time": "09:15:00",
            "market_close_time": "15:30:00",
            "current_time": now.strftime("%H:%M:%S"),
            "next_event": next_event,
            "time_to_event": time_to_event,
            "timezone": "IST",
            "timestamp": now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market status: {str(e)}"
        )

@router.get("/sectors")
async def get_sector_performance(current_user: User = Depends(get_current_user)):
    """Get sector-wise performance"""
    try:
        # Sample sector data with representative stocks
        sectors = {
            "IT": ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM"],
            "Banking": ["HDFC", "ICICI", "SBIN", "KOTAKBANK", "AXISBANK"],
            "Auto": ["MARUTI", "TATAMOTORS", "M&M", "BAJAJ-AUTO", "EICHERMOT"],
            "Pharma": ["SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "BIOCON"],
            "FMCG": ["HINDUNILVR", "ITC", "NESTLEIND", "BRITANNIA", "DABUR"]
        }
        
        sector_performance = []
        
        for sector_name, symbols in sectors.items():
            try:
                # Get data for first 2 symbols in each sector (to respect rate limits)
                sector_changes = []
                
                for symbol in symbols[:2]:
                    cached_data = await get_cached_data(symbol)
                    if cached_data and cached_data.get("change_percent"):
                        sector_changes.append(cached_data["change_percent"])
                
                # Calculate average change
                avg_change = sum(sector_changes) / len(sector_changes) if sector_changes else 0
                
                sector_performance.append({
                    "sector": sector_name,
                    "change_percent": round(avg_change, 2),
                    "stocks_count": len(symbols),
                    "status": "positive" if avg_change > 0 else "negative" if avg_change < 0 else "neutral"
                })
                
            except Exception as e:
                # Add neutral sector if data fetch fails
                sector_performance.append({
                    "sector": sector_name,
                    "change_percent": 0.0,
                    "stocks_count": len(symbols),
                    "status": "neutral"
                })
        
        return {
            "sectors": sector_performance,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sector performance: {str(e)}"
        )

@router.get("/top-movers")
async def get_top_movers(current_user: User = Depends(get_current_user)):
    """Get top gaining and losing stocks"""
    try:
        # Sample stocks for demonstration
        sample_symbols = [
            "RELIANCE", "TCS", "INFY", "HDFC", "ICICI",
            "SBIN", "BHARTIARTL", "KOTAKBANK", "LT", "HCLTECH",
            "ASIANPAINT", "MARUTI", "BAJFINANCE", "TITAN", "SUNPHARMA"
        ]
        
        stocks_data = []
        
        for symbol in sample_symbols:
            try:
                cached_data = await get_cached_data(symbol)
                if cached_data:
                    stocks_data.append({
                        "symbol": symbol,
                        "ltp": cached_data.get("ltp", 0),
                        "change_percent": cached_data.get("change_percent", 0),
                        "volume": cached_data.get("volume", 0)
                    })
            except:
                continue
        
        # Sort by change percent
        top_gainers = sorted(
            [s for s in stocks_data if s["change_percent"] > 0], 
            key=lambda x: x["change_percent"], 
            reverse=True
        )[:5]
        
        top_losers = sorted(
            [s for s in stocks_data if s["change_percent"] < 0], 
            key=lambda x: x["change_percent"]
        )[:5]
        
        # Most active by volume
        most_active = sorted(
            stocks_data, 
            key=lambda x: x["volume"], 
            reverse=True
        )[:5]
        
        return {
            "top_gainers": top_gainers,
            "top_losers": top_losers,
            "most_active": most_active,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get top movers: {str(e)}"
        )
