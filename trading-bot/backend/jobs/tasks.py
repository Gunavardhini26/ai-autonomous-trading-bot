import asyncio
import logging
from datetime import datetime, time
from typing import List
from celery import Task

from jobs import celery_app
from db.database import get_db
from broker.angel_one import AngelOneClient
from data.historical_fetch import AlphaVantageClient
from ai.lstm_model import LSTMModel
from ai.rl_agent import TradingRLAgent
from news.sentiment import NewsSentimentAnalyzer

logger = logging.getLogger(__name__)

def is_market_hours() -> bool:
    """Check if current time is during market hours (9:15 AM to 3:30 PM IST)"""
    now = datetime.now()
    market_start = time(9, 15)
    market_end = time(15, 30)
    
    # Check if it's a weekday and within market hours
    return (now.weekday() < 5 and 
            market_start <= now.time() <= market_end)

class AsyncTask(Task):
    """Custom Celery task class that supports asyncio"""
    
    def __call__(self, *args, **kwargs):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.run(*args, **kwargs))
        finally:
            loop.close()

@celery_app.task(bind=True, base=AsyncTask)
async def fetch_market_data(self) -> dict:
    """Fetch live market data for all watchlist symbols"""
    try:
        if not is_market_hours():
            logger.info("Market is closed, skipping live data fetch")
            return {"status": "skipped", "reason": "market_closed"}
        
        # Get database session
        db = next(get_db())
        
        # Initialize Angel One client
        angel_client = AngelOneClient()
        await angel_client.authenticate()
        
        # Get all watchlist symbols (you can customize this)
        symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC", "WIPRO", "ONGC", "TATAMOTORS"]
        
        # Fetch live data
        market_data = []
        for symbol in symbols:
            try:
                data = await angel_client.get_live_data(symbol)
                if data:
                    market_data.append(data)
            except Exception as e:
                logger.error(f"Error fetching data for {symbol}: {e}")
        
        logger.info(f"Fetched market data for {len(market_data)} symbols")
        return {"status": "success", "symbols_updated": len(market_data)}
        
    except Exception as e:
        logger.error(f"Error in fetch_market_data task: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task(bind=True, base=AsyncTask)
async def train_lstm_models(self, symbols: List[str] = None) -> dict:
    """Train LSTM models for specified symbols"""
    try:
        if symbols is None:
            symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK"]
        
        # Initialize clients
        alpha_client = AlphaVantageClient()
        
        results = {}
        for symbol in symbols:
            try:
                logger.info(f"Training LSTM model for {symbol}")
                
                # Fetch historical data
                historical_data = await alpha_client.get_historical_data(
                    symbol=symbol,
                    interval="daily",
                    outputsize="full"
                )
                
                if historical_data:
                    # Initialize and train LSTM model
                    lstm_model = LSTMModel(symbol=symbol)
                    
                    # Prepare data and train
                    success = await lstm_model.train(historical_data)
                    
                    if success:
                        # Save model
                        await lstm_model.save_model()
                        results[symbol] = "success"
                        logger.info(f"LSTM model trained successfully for {symbol}")
                    else:
                        results[symbol] = "training_failed"
                        logger.error(f"LSTM training failed for {symbol}")
                else:
                    results[symbol] = "no_data"
                    logger.warning(f"No historical data available for {symbol}")
                    
            except Exception as e:
                logger.error(f"Error training LSTM for {symbol}: {e}")
                results[symbol] = f"error: {str(e)}"
        
        return {"status": "completed", "results": results}
        
    except Exception as e:
        logger.error(f"Error in train_lstm_models task: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task(bind=True, base=AsyncTask)
async def analyze_news_sentiment(self) -> dict:
    """Analyze sentiment of latest news articles"""
    try:
        # Initialize news sentiment analyzer
        sentiment_analyzer = NewsSentimentAnalyzer()
        
        # Fetch latest news
        articles = await sentiment_analyzer.fetch_news()
        
        analyzed_count = 0
        for article in articles:
            try:
                # Analyze sentiment
                sentiment_result = await sentiment_analyzer.analyze_sentiment(article["content"])
                
                # Store in database (implement based on your model)
                # This would typically involve saving the article and sentiment to your database
                analyzed_count += 1
                
            except Exception as e:
                logger.error(f"Error analyzing sentiment for article: {e}")
        
        logger.info(f"Analyzed sentiment for {analyzed_count} articles")
        return {"status": "success", "articles_analyzed": analyzed_count}
        
    except Exception as e:
        logger.error(f"Error in analyze_news_sentiment task: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task(bind=True, base=AsyncTask)
async def update_technical_indicators(self, symbols: List[str] = None) -> dict:
    """Update technical indicators for specified symbols"""
    try:
        if symbols is None:
            symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK"]
        
        # Initialize Alpha Vantage client
        alpha_client = AlphaVantageClient()
        
        results = {}
        for symbol in symbols:
            try:
                logger.info(f"Updating technical indicators for {symbol}")
                
                # Fetch technical indicators
                indicators = await alpha_client.get_technical_indicators(symbol)
                
                if indicators:
                    # Store indicators in database
                    # This would involve saving to your TechnicalIndicator model
                    results[symbol] = "success"
                    logger.info(f"Updated technical indicators for {symbol}")
                else:
                    results[symbol] = "no_data"
                    
            except Exception as e:
                logger.error(f"Error updating indicators for {symbol}: {e}")
                results[symbol] = f"error: {str(e)}"
        
        return {"status": "completed", "results": results}
        
    except Exception as e:
        logger.error(f"Error in update_technical_indicators task: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task(bind=True, base=AsyncTask)
async def execute_ai_trading_signals(self) -> dict:
    """Execute trades based on AI signals"""
    try:
        # This is where you'd implement the logic to:
        # 1. Get AI signals from LSTM and RL models
        # 2. Apply risk management rules
        # 3. Execute trades via Angel One API
        # 4. Update positions and portfolio
        
        logger.info("Executing AI trading signals")
        
        # Initialize clients
        angel_client = AngelOneClient()
        await angel_client.authenticate()
        
        # Get AI signals (implement based on your AI models)
        signals = []  # This would fetch from your AI models
        
        executed_trades = 0
        for signal in signals:
            try:
                # Apply risk management and position sizing
                # Execute trade via Angel One
                # Update database
                executed_trades += 1
                
            except Exception as e:
                logger.error(f"Error executing trade for signal: {e}")
        
        return {"status": "success", "trades_executed": executed_trades}
        
    except Exception as e:
        logger.error(f"Error in execute_ai_trading_signals task: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task(bind=True, base=AsyncTask)
async def train_rl_agent(self, symbol: str) -> dict:
    """Train reinforcement learning agent for a specific symbol"""
    try:
        logger.info(f"Training RL agent for {symbol}")
        
        # Initialize RL agent
        rl_agent = TradingRLAgent(symbol=symbol)
        
        # Fetch historical data for training
        alpha_client = AlphaVantageClient()
        historical_data = await alpha_client.get_historical_data(
            symbol=symbol,
            interval="daily",
            outputsize="full"
        )
        
        if historical_data:
            # Train the RL agent
            success = await rl_agent.train(historical_data)
            
            if success:
                # Save the trained model
                await rl_agent.save_model()
                logger.info(f"RL agent trained successfully for {symbol}")
                return {"status": "success", "symbol": symbol}
            else:
                logger.error(f"RL training failed for {symbol}")
                return {"status": "training_failed", "symbol": symbol}
        else:
            logger.warning(f"No historical data available for {symbol}")
            return {"status": "no_data", "symbol": symbol}
            
    except Exception as e:
        logger.error(f"Error in train_rl_agent task: {e}")
        return {"status": "error", "error": str(e)}

# Additional utility tasks
@celery_app.task
def cleanup_old_data() -> dict:
    """Clean up old market data and logs"""
    try:
        # Implement cleanup logic for old market data, logs, etc.
        logger.info("Cleaning up old data")
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_data task: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task
def health_check() -> dict:
    """Health check task for monitoring"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
