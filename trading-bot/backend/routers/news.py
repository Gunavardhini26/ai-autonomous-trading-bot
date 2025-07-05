from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

from db.database import get_db
from db.models import User, NewsArticle
from security.auth import get_current_user
from news.sentiment import news_analyzer

router = APIRouter()

# Pydantic models
class NewsResponse(BaseModel):
    title: str
    description: Optional[str]
    url: Optional[str]
    source: str
    published_at: str
    sentiment: Dict
    mentioned_symbols: List[str]
    relevance_score: float

class SentimentSummary(BaseModel):
    overall_sentiment: str
    average_score: float
    total_articles: int
    positive_articles: int
    negative_articles: int
    neutral_articles: int

@router.get("/market-news")
async def get_market_news(
    current_user: User = Depends(get_current_user),
    query: str = "indian stock market",
    page_size: int = 20
):
    """Get latest market news with sentiment analysis"""
    try:
        news_result = await news_analyzer.fetch_market_news(
            query=query,
            page_size=page_size
        )
        
        if not news_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=news_result.get("error", "Failed to fetch news")
            )
        
        return {
            "success": True,
            "articles": news_result["articles"],
            "total_results": news_result["total_results"],
            "query": query,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch market news: {str(e)}"
        )

@router.get("/company-news/{symbol}")
async def get_company_news(
    symbol: str,
    current_user: User = Depends(get_current_user),
    days_back: int = 7
):
    """Get news for a specific company/symbol"""
    try:
        # Map symbol to company name for better search
        company_mapping = {
            "RELIANCE": "Reliance Industries",
            "TCS": "Tata Consultancy Services",
            "INFY": "Infosys",
            "HDFC": "HDFC Bank",
            "ICICI": "ICICI Bank",
            "SBIN": "State Bank of India",
            "BHARTIARTL": "Bharti Airtel",
            "KOTAKBANK": "Kotak Mahindra Bank",
            "LT": "Larsen & Toubro",
            "HCLTECH": "HCL Technologies"
        }
        
        company_name = company_mapping.get(symbol.upper(), symbol)
        
        news_result = await news_analyzer.fetch_company_news(
            company_name=company_name,
            days_back=days_back
        )
        
        if not news_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=news_result.get("error", "Failed to fetch company news")
            )
        
        return {
            "success": True,
            "symbol": symbol,
            "company": company_name,
            "articles": news_result["articles"],
            "total_results": news_result["total_results"],
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch company news: {str(e)}"
        )

@router.get("/sector-news/{sector}")
async def get_sector_news(
    sector: str,
    current_user: User = Depends(get_current_user),
    days_back: int = 3
):
    """Get sector-specific news"""
    try:
        allowed_sectors = ["technology", "banking", "pharma", "auto", "energy", "fmcg"]
        
        if sector.lower() not in allowed_sectors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sector must be one of: {', '.join(allowed_sectors)}"
            )
        
        news_result = await news_analyzer.fetch_sector_news(
            sector=sector,
            days_back=days_back
        )
        
        if not news_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=news_result.get("error", "Failed to fetch sector news")
            )
        
        return {
            "success": True,
            "sector": sector,
            "articles": news_result["articles"],
            "total_results": news_result["total_results"],
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sector news: {str(e)}"
        )

@router.get("/sentiment/market", response_model=Dict)
async def get_market_sentiment(current_user: User = Depends(get_current_user)):
    """Get overall market sentiment summary"""
    try:
        sentiment_result = await news_analyzer.get_market_sentiment_summary()
        
        if not sentiment_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=sentiment_result.get("error", "Failed to analyze market sentiment")
            )
        
        return sentiment_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market sentiment: {str(e)}"
        )

@router.get("/sentiment/{symbol}")
async def get_symbol_sentiment(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get sentiment analysis for a specific stock symbol"""
    try:
        sentiment_result = await news_analyzer.get_symbol_sentiment(symbol)
        
        if not sentiment_result.get("success"):
            return {
                "success": True,
                "symbol": symbol,
                "sentiment": "neutral",
                "score": 0.0,
                "confidence": 0.0,
                "article_count": 0,
                "message": "No recent news found or analysis failed"
            }
        
        return sentiment_result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get symbol sentiment: {str(e)}"
        )

@router.get("/trending-topics")
async def get_trending_topics(current_user: User = Depends(get_current_user)):
    """Get trending financial topics and their sentiment"""
    try:
        # Get news for various trending topics
        topics = [
            "indian economy",
            "stock market rally",
            "market crash",
            "inflation india",
            "interest rates rbi",
            "foreign investment india"
        ]
        
        trending_data = []
        
        for topic in topics:
            try:
                news_result = await news_analyzer.fetch_market_news(
                    query=topic,
                    page_size=5
                )
                
                if news_result.get("success") and news_result["articles"]:
                    # Calculate average sentiment for topic
                    sentiments = [
                        article["sentiment"]["score"] 
                        for article in news_result["articles"] 
                        if article.get("sentiment")
                    ]
                    
                    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
                    
                    trending_data.append({
                        "topic": topic,
                        "article_count": len(news_result["articles"]),
                        "avg_sentiment": round(avg_sentiment, 3),
                        "sentiment_label": "positive" if avg_sentiment > 0.1 else "negative" if avg_sentiment < -0.1 else "neutral",
                        "recent_articles": news_result["articles"][:3]  # Top 3 articles
                    })
                
            except Exception as e:
                # Skip failed topics
                continue
        
        # Sort by article count and sentiment significance
        trending_data.sort(key=lambda x: (x["article_count"], abs(x["avg_sentiment"])), reverse=True)
        
        return {
            "trending_topics": trending_data,
            "total_topics": len(trending_data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get trending topics: {str(e)}"
        )

@router.get("/sentiment/dashboard")
async def get_sentiment_dashboard(current_user: User = Depends(get_current_user)):
    """Get comprehensive sentiment dashboard"""
    try:
        # Get market sentiment
        market_sentiment = await news_analyzer.get_market_sentiment_summary()
        
        # Get sentiment for major stocks
        major_stocks = ["RELIANCE", "TCS", "INFY", "HDFC", "ICICI"]
        stock_sentiments = {}
        
        for symbol in major_stocks:
            try:
                sentiment = await news_analyzer.get_symbol_sentiment(symbol)
                if sentiment.get("success"):
                    stock_sentiments[symbol] = {
                        "sentiment": sentiment["sentiment"],
                        "score": sentiment["score"],
                        "confidence": sentiment["confidence"],
                        "article_count": sentiment["article_count"]
                    }
            except:
                stock_sentiments[symbol] = {
                    "sentiment": "neutral",
                    "score": 0.0,
                    "confidence": 0.0,
                    "article_count": 0
                }
        
        # Get sector sentiment (simplified)
        sectors = ["technology", "banking", "pharma"]
        sector_sentiments = {}
        
        for sector in sectors:
            try:
                news_result = await news_analyzer.fetch_sector_news(sector, days_back=2)
                if news_result.get("success") and news_result["articles"]:
                    sentiments = [
                        article["sentiment"]["score"] 
                        for article in news_result["articles"] 
                        if article.get("sentiment")
                    ]
                    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
                    
                    sector_sentiments[sector] = {
                        "avg_sentiment": round(avg_sentiment, 3),
                        "sentiment_label": "positive" if avg_sentiment > 0.1 else "negative" if avg_sentiment < -0.1 else "neutral",
                        "article_count": len(news_result["articles"])
                    }
            except:
                sector_sentiments[sector] = {
                    "avg_sentiment": 0.0,
                    "sentiment_label": "neutral",
                    "article_count": 0
                }
        
        return {
            "market_sentiment": market_sentiment if market_sentiment.get("success") else {
                "overall_sentiment": "neutral",
                "average_score": 0.0,
                "total_articles": 0
            },
            "stock_sentiments": stock_sentiments,
            "sector_sentiments": sector_sentiments,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sentiment dashboard: {str(e)}"
        )

@router.post("/analyze-text")
async def analyze_custom_text(
    text: str,
    current_user: User = Depends(get_current_user)
):
    """Analyze sentiment of custom text"""
    try:
        if not text or len(text.strip()) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text must be at least 10 characters long"
            )
        
        # Use the sentiment analyzer
        sentiment_data = news_analyzer._analyze_sentiment(text)
        
        return {
            "success": True,
            "text": text[:100] + "..." if len(text) > 100 else text,
            "sentiment": sentiment_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text analysis failed: {str(e)}"
        )
