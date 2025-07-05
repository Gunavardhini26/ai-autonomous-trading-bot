import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/trading_bot")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Angel One SmartAPI
ANGEL_API_KEY = os.getenv("ANGEL_API_KEY", "Zh1i8PYW")
ANGEL_CLIENT_ID = os.getenv("ANGEL_CLIENT_ID", "AAAH308879")  
ANGEL_SECRET_KEY = os.getenv("ANGEL_SECRET_KEY", "349b824c-c12c-46ad-8aa7-3f0c357c5020")
ANGEL_BASE_URL = "https://apiconnect.angelbroking.com"

# Alpha Vantage
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "EC1CRBHX7KYEKJ8C")
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co"

# News API
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "ba4e883c48c640dd8449b0f9063b9855")
NEWS_API_BASE_URL = "https://newsapi.org/v2"

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# AI/ML Settings
MODEL_RETRAIN_INTERVAL_HOURS = 24
LSTM_SEQUENCE_LENGTH = 60
RL_LEARNING_RATE = 0.001
RL_BATCH_SIZE = 32
RL_MEMORY_SIZE = 10000

# Trading Settings
MAX_POSITION_SIZE = 100000  # INR
MAX_DAILY_LOSS = 5000      # INR
PAPER_TRADING_INITIAL_BALANCE = 1000000  # INR

# Rate Limits
ANGEL_ONE_RATE_LIMIT = 1   # requests per second
ALPHA_VANTAGE_RATE_LIMIT = 5  # requests per minute
NEWS_API_RATE_LIMIT = 100     # requests per day
