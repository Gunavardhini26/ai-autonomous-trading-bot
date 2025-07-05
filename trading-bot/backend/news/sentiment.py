import requests
import asyncio
import time
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import re
import json
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from config import NEWS_API_KEY, NEWS_API_BASE_URL, NEWS_API_RATE_LIMIT

logger = logging.getLogger(__name__)

class NewsAnalyzer:
    def __init__(self):
        self.api_key = NEWS_API_KEY
        self.base_url = NEWS_API_BASE_URL
        self.last_request_time = 0
        self.daily_request_count = 0
        self.last_reset_date = datetime.now().date()
        self.vader_analyzer = SentimentIntensityAnalyzer()
        
        # Common Indian stock symbols and company names for filtering
        self.indian_companies = {
            'RELIANCE': ['reliance', 'ril', 'jio'],
            'TCS': ['tata consultancy', 'tcs', 'tata'],
            'INFY': ['infosys', 'infy'],
            'HDFC': ['hdfc', 'housing development'],
            'ICICI': ['icici', 'icici bank'],
            'SBIN': ['state bank', 'sbi', 'sbin'],
            'BHARTIARTL': ['bharti airtel', 'airtel'],
            'KOTAKBANK': ['kotak mahindra', 'kotak'],
            'LT': ['larsen toubro', 'l&t'],
            'HCLTECH': ['hcl technologies', 'hcl'],
            'ASIANPAINT': ['asian paints'],
            'MARUTI': ['maruti suzuki', 'maruti'],
            'BAJFINANCE': ['bajaj finance'],
            'TITAN': ['titan company'],
            'SUNPHARMA': ['sun pharma', 'sun pharmaceutical'],
        }
    
    async def rate_limit(self):
        """Enforce rate limiting for News API (100 requests per day)"""
        current_time = time.time()
        
        # Reset daily counter if new day
        if datetime.now().date() > self.last_reset_date:
            self.daily_request_count = 0
            self.last_reset_date = datetime.now().date()
        
        # Check daily limit
        if self.daily_request_count >= NEWS_API_RATE_LIMIT:
            logger.warning("News API daily limit reached")
            raise Exception("Daily API limit reached")
        
        # Small delay between requests
        time_since_last = current_time - self.last_request_time
        if time_since_last < 1.0:  # 1 second minimum between requests
            await asyncio.sleep(1.0 - time_since_last)
        
        self.last_request_time = time.time()
        self.daily_request_count += 1

    async def fetch_market_news(
        self, 
        query: str = "indian stock market", 
        language: str = "en",
        sort_by: str = "publishedAt",
        page_size: int = 20
    ) -> Dict:
        """Fetch general market news"""
        await self.rate_limit()
        
        try:
            params = {
                "q": query,
                "language": language,
                "sortBy": sort_by,
                "pageSize": page_size,
                "apiKey": self.api_key
            }
            
            response = requests.get(f"{self.base_url}/everything", params=params)
            data = response.json()
            
            if data.get("status") != "ok":
                return {"success": False, "error": data.get("message", "Unknown error")}
            
            articles = data.get("articles", [])
            processed_articles = []
            
            for article in articles:
                processed_article = await self._process_article(article)
                if processed_article:
                    processed_articles.append(processed_article)
            
            return {
                "success": True,
                "total_results": data.get("totalResults", 0),
                "articles": processed_articles,
                "query": query,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Market news fetch failed: {e}")
            return {"success": False, "error": str(e)}

    async def fetch_company_news(self, company_name: str, days_back: int = 7) -> Dict:
        """Fetch news for a specific company"""
        await self.rate_limit()
        
        try:
            # Calculate date range
            from_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
            
            params = {
                "q": company_name,
                "from": from_date,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 20,
                "apiKey": self.api_key
            }
            
            response = requests.get(f"{self.base_url}/everything", params=params)
            data = response.json()
            
            if data.get("status") != "ok":
                return {"success": False, "error": data.get("message", "Unknown error")}
            
            articles = data.get("articles", [])
            processed_articles = []
            
            for article in articles:
                processed_article = await self._process_article(article, target_company=company_name)
                if processed_article:
                    processed_articles.append(processed_article)
            
            return {
                "success": True,
                "total_results": data.get("totalResults", 0),
                "articles": processed_articles,
                "company": company_name,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Company news fetch failed for {company_name}: {e}")
            return {"success": False, "error": str(e)}

    async def fetch_sector_news(self, sector: str = "technology", days_back: int = 3) -> Dict:
        """Fetch sector-specific news"""
        sector_queries = {
            "technology": "india technology sector IT software",
            "banking": "india banking sector finance",
            "pharma": "india pharmaceutical sector healthcare",
            "auto": "india automotive sector cars",
            "energy": "india energy sector oil gas",
            "fmcg": "india consumer goods fmcg"
        }
        
        query = sector_queries.get(sector.lower(), f"india {sector} sector")
        
        await self.rate_limit()
        
        try:
            from_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
            
            params = {
                "q": query,
                "from": from_date,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 15,
                "apiKey": self.api_key
            }
            
            response = requests.get(f"{self.base_url}/everything", params=params)
            data = response.json()
            
            if data.get("status") != "ok":
                return {"success": False, "error": data.get("message", "Unknown error")}
            
            articles = data.get("articles", [])
            processed_articles = []
            
            for article in articles:
                processed_article = await self._process_article(article)
                if processed_article:
                    processed_articles.append(processed_article)
            
            return {
                "success": True,
                "total_results": data.get("totalResults", 0),
                "articles": processed_articles,
                "sector": sector,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Sector news fetch failed for {sector}: {e}")
            return {"success": False, "error": str(e)}

    async def _process_article(self, article: Dict, target_company: str = None) -> Optional[Dict]:
        """Process and analyze individual article"""
        try:
            title = article.get("title", "")
            description = article.get("description", "")
            content = article.get("content", "")
            
            # Combine text for analysis
            full_text = f"{title} {description} {content}".strip()
            
            if not full_text or len(full_text) < 50:
                return None  # Skip articles with insufficient content
            
            # Perform sentiment analysis
            sentiment_data = self._analyze_sentiment(full_text)
            
            # Extract mentioned companies
            mentioned_symbols = self._extract_stock_symbols(full_text)
            
            # Calculate relevance score
            relevance_score = self._calculate_relevance(full_text, target_company)
            
            processed_article = {
                "title": title,
                "description": description,
                "url": article.get("url"),
                "source": article.get("source", {}).get("name", "Unknown"),
                "published_at": article.get("publishedAt"),
                "sentiment": sentiment_data,
                "mentioned_symbols": mentioned_symbols,
                "relevance_score": relevance_score,
                "article_length": len(full_text),
                "processed_at": datetime.now().isoformat()
            }
            
            return processed_article
            
        except Exception as e:
            logger.error(f"Article processing failed: {e}")
            return None

    def _analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment using multiple methods"""
        try:
            # Clean text
            cleaned_text = self._clean_text(text)
            
            # TextBlob sentiment
            blob = TextBlob(cleaned_text)
            textblob_polarity = blob.sentiment.polarity
            textblob_subjectivity = blob.sentiment.subjectivity
            
            # VADER sentiment
            vader_scores = self.vader_analyzer.polarity_scores(cleaned_text)
            
            # Combine scores
            combined_score = (textblob_polarity + vader_scores['compound']) / 2
            
            # Determine label
            if combined_score >= 0.1:
                label = "positive"
            elif combined_score <= -0.1:
                label = "negative"
            else:
                label = "neutral"
            
            return {
                "score": round(combined_score, 3),
                "label": label,
                "confidence": round(abs(combined_score), 3),
                "textblob_polarity": round(textblob_polarity, 3),
                "textblob_subjectivity": round(textblob_subjectivity, 3),
                "vader_compound": round(vader_scores['compound'], 3),
                "vader_positive": round(vader_scores['pos'], 3),
                "vader_negative": round(vader_scores['neg'], 3),
                "vader_neutral": round(vader_scores['neu'], 3)
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {
                "score": 0.0,
                "label": "neutral",
                "confidence": 0.0
            }

    def _clean_text(self, text: str) -> str:
        """Clean text for sentiment analysis"""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:-]', '', text)
        
        return text.strip()

    def _extract_stock_symbols(self, text: str) -> List[str]:
        """Extract mentioned stock symbols from text"""
        mentioned_symbols = []
        text_lower = text.lower()
        
        for symbol, keywords in self.indian_companies.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    if symbol not in mentioned_symbols:
                        mentioned_symbols.append(symbol)
                    break
        
        return mentioned_symbols

    def _calculate_relevance(self, text: str, target_company: str = None) -> float:
        """Calculate relevance score of article"""
        text_lower = text.lower()
        
        # Base relevance keywords
        financial_keywords = [
            'stock', 'share', 'trading', 'market', 'investment', 'profit', 'loss',
            'earnings', 'revenue', 'growth', 'decline', 'bull', 'bear', 'nse', 'bse'
        ]
        
        relevance_score = 0.0
        
        # Count financial keywords
        for keyword in financial_keywords:
            if keyword in text_lower:
                relevance_score += 0.1
        
        # Boost score if target company is mentioned
        if target_company:
            target_keywords = self.indian_companies.get(target_company.upper(), [target_company.lower()])
            for keyword in target_keywords:
                if keyword.lower() in text_lower:
                    relevance_score += 0.5
                    break
        
        # Cap at 1.0
        return min(relevance_score, 1.0)

    async def get_market_sentiment_summary(self) -> Dict:
        """Get overall market sentiment summary"""
        try:
            # Fetch recent market news
            market_news = await self.fetch_market_news(
                query="indian stock market nse bse",
                page_size=50
            )
            
            if not market_news.get("success"):
                return {"success": False, "error": "Failed to fetch market news"}
            
            articles = market_news.get("articles", [])
            
            if not articles:
                return {"success": False, "error": "No articles found"}
            
            # Analyze overall sentiment
            sentiment_scores = []
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            
            for article in articles:
                sentiment = article.get("sentiment", {})
                score = sentiment.get("score", 0)
                label = sentiment.get("label", "neutral")
                
                sentiment_scores.append(score)
                
                if label == "positive":
                    positive_count += 1
                elif label == "negative":
                    negative_count += 1
                else:
                    neutral_count += 1
            
            # Calculate summary statistics
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
            
            # Determine overall market sentiment
            if avg_sentiment >= 0.1:
                overall_sentiment = "positive"
            elif avg_sentiment <= -0.1:
                overall_sentiment = "negative"
            else:
                overall_sentiment = "neutral"
            
            return {
                "success": True,
                "overall_sentiment": overall_sentiment,
                "average_score": round(avg_sentiment, 3),
                "total_articles": len(articles),
                "positive_articles": positive_count,
                "negative_articles": negative_count,
                "neutral_articles": neutral_count,
                "sentiment_distribution": {
                    "positive": round(positive_count / len(articles) * 100, 1),
                    "negative": round(negative_count / len(articles) * 100, 1),
                    "neutral": round(neutral_count / len(articles) * 100, 1)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Market sentiment summary failed: {e}")
            return {"success": False, "error": str(e)}

    async def get_symbol_sentiment(self, symbol: str) -> Dict:
        """Get sentiment analysis for a specific stock symbol"""
        try:
            # Get company name from symbol
            company_keywords = self.indian_companies.get(symbol.upper())
            if not company_keywords:
                company_name = symbol
            else:
                company_name = company_keywords[0]
            
            # Fetch company-specific news
            company_news = await self.fetch_company_news(company_name, days_back=7)
            
            if not company_news.get("success"):
                return {"success": False, "error": f"Failed to fetch news for {symbol}"}
            
            articles = company_news.get("articles", [])
            
            if not articles:
                return {
                    "success": True,
                    "symbol": symbol,
                    "sentiment": "neutral",
                    "score": 0.0,
                    "confidence": 0.0,
                    "article_count": 0,
                    "message": "No recent news found"
                }
            
            # Filter articles that mention the symbol
            relevant_articles = [
                article for article in articles 
                if symbol.upper() in article.get("mentioned_symbols", []) or 
                   article.get("relevance_score", 0) > 0.3
            ]
            
            if not relevant_articles:
                relevant_articles = articles[:5]  # Use top 5 if no specific mentions
            
            # Calculate weighted sentiment
            sentiment_scores = []
            weights = []
            
            for article in relevant_articles:
                sentiment = article.get("sentiment", {})
                score = sentiment.get("score", 0)
                confidence = sentiment.get("confidence", 0)
                relevance = article.get("relevance_score", 0.5)
                
                # Weight by confidence and relevance
                weight = confidence * relevance
                sentiment_scores.append(score)
                weights.append(weight)
            
            # Calculate weighted average
            if weights and sum(weights) > 0:
                weighted_sentiment = sum(s * w for s, w in zip(sentiment_scores, weights)) / sum(weights)
            else:
                weighted_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
            
            # Determine sentiment label
            if weighted_sentiment >= 0.1:
                sentiment_label = "positive"
            elif weighted_sentiment <= -0.1:
                sentiment_label = "negative"
            else:
                sentiment_label = "neutral"
            
            return {
                "success": True,
                "symbol": symbol,
                "sentiment": sentiment_label,
                "score": round(weighted_sentiment, 3),
                "confidence": round(abs(weighted_sentiment), 3),
                "article_count": len(relevant_articles),
                "total_articles": len(articles),
                "recent_articles": relevant_articles[:3],  # Return top 3 for reference
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Symbol sentiment analysis failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

# Global instance
news_analyzer = NewsAnalyzer()
