from celery import Celery
import os

# Initialize Celery
celery_app = Celery(
    "trading_bot",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379")
)

# Configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Kolkata',
    enable_utc=True,
    beat_schedule={
        'fetch-market-data': {
            'task': 'jobs.tasks.fetch_market_data',
            'schedule': 30.0,  # Every 30 seconds during market hours
        },
        'train-lstm-models': {
            'task': 'jobs.tasks.train_lstm_models',
            'schedule': 3600.0,  # Every hour
        },
        'analyze-news-sentiment': {
            'task': 'jobs.tasks.analyze_news_sentiment',
            'schedule': 300.0,  # Every 5 minutes
        },
        'update-technical-indicators': {
            'task': 'jobs.tasks.update_technical_indicators',
            'schedule': 60.0,  # Every minute
        },
    }
)
