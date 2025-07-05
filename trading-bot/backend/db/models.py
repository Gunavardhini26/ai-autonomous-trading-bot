from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from db.database import Base

class OrderType(enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderStatus(enum.Enum):
    PENDING = "PENDING"
    EXECUTED = "EXECUTED"
    CANCELLED = "CANCELLED"
    PARTIAL = "PARTIAL"

class TradingMode(enum.Enum):
    PAPER = "PAPER"
    LIVE = "LIVE"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    angel_access_token = Column(String, nullable=True)
    angel_refresh_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    trading_mode = Column(Enum(TradingMode), default=TradingMode.PAPER)
    paper_balance = Column(Float, default=1000000.0)  # 10L INR
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    trades = relationship("Trade", back_populates="user")
    positions = relationship("Position", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, nullable=False)
    order_type = Column(Enum(OrderType), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    angel_order_id = Column(String, nullable=True)
    pnl = Column(Float, default=0.0)
    trading_mode = Column(Enum(TradingMode), nullable=False)
    ai_signal_confidence = Column(Float, nullable=True)
    strategy_used = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="trades")

class Position(Base):
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    avg_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    pnl = Column(Float, default=0.0)
    trading_mode = Column(Enum(TradingMode), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="positions")

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    open_price = Column(Float, nullable=False)
    high_price = Column(Float, nullable=False)
    low_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class TechnicalIndicator(Base):
    __tablename__ = "technical_indicators"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    rsi = Column(Float, nullable=True)
    macd = Column(Float, nullable=True)
    macd_signal = Column(Float, nullable=True)
    ema_20 = Column(Float, nullable=True)
    ema_50 = Column(Float, nullable=True)
    vwap = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AISignal(Base):
    __tablename__ = "ai_signals"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    signal_type = Column(String, nullable=False)  # BUY, SELL, HOLD
    confidence = Column(Float, nullable=False)
    lstm_prediction = Column(Float, nullable=True)
    rl_action = Column(String, nullable=True)
    model_version = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    source = Column(String, nullable=False)
    url = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True)  # -1 to 1
    sentiment_label = Column(String, nullable=True)  # positive, negative, neutral
    symbols_mentioned = Column(String, nullable=True)  # JSON array
    published_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    max_position_size = Column(Float, default=100000.0)
    max_daily_loss = Column(Float, default=5000.0)
    stop_loss_percentage = Column(Float, default=2.0)
    take_profit_percentage = Column(Float, default=5.0)
    enable_ai_trading = Column(Boolean, default=True)
    enable_news_sentiment = Column(Boolean, default=True)
    risk_tolerance = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH
    theme = Column(String, default="light")  # light, dark
    
    # Relationships
    user = relationship("User", back_populates="settings")

class ModelPerformance(Base):
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String, nullable=False)  # LSTM, RL
    symbol = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    total_profit = Column(Float, nullable=True)
    win_rate = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    training_date = Column(DateTime(timezone=True), server_default=func.now())
