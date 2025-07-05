# AI-Powered Autonomous Trading Bot

A complete, full-stack, lightning-fast AI-powered autonomous trading bot for the Indian stock market using real-time live data, Angel One SmartAPI, AI models (LSTM + Reinforcement Learning), real-time charting, technical indicators, news sentiment analysis, and a modern web interface.

## 🚀 Features

### Core Trading Features
- **Live Market Data**: Real-time data from Angel One SmartAPI
- **Paper & Live Trading**: Switch between paper and live trading modes
- **Portfolio Management**: Real-time portfolio tracking with P&L
- **Order Management**: Market and limit orders with auto-execution
- **Position Tracking**: Real-time position monitoring and management

### AI & Machine Learning
- **LSTM Models**: Price prediction using deep learning
- **Reinforcement Learning**: Intelligent trading agent
- **Technical Indicators**: 20+ indicators (RSI, MACD, Bollinger Bands, etc.)
- **Backtesting**: Historical strategy performance analysis
- **Model Performance Tracking**: Real-time accuracy metrics

### News & Sentiment Analysis
- **Real-time News**: Latest financial news from multiple sources
- **Sentiment Analysis**: AI-powered sentiment scoring
- **Symbol Correlation**: News impact on specific stocks
- **Alert System**: Sentiment-based trading alerts

### Modern Web Interface
- **Real-time Dashboard**: Live market overview and portfolio
- **Interactive Charts**: TradingView-style charts with indicators
- **Strategy Lab**: Create and test trading strategies
- **AI Monitor**: Model performance and signal tracking
- **News Feed**: Real-time news with sentiment analysis

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **FastAPI**: High-performance async API framework
- **PostgreSQL**: Primary database for all data storage
- **Redis**: Caching, session management, and real-time data
- **Celery**: Background tasks for AI training and data fetching
- **WebSockets**: Real-time data streaming to frontend
- **SQLAlchemy**: ORM for database operations

### Frontend (React + TypeScript)
- **React 18**: Modern component-based UI
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **TailwindCSS**: Utility-first styling
- **Chart.js**: Interactive charts and visualizations
- **Socket.IO**: Real-time data updates

### AI/ML Stack
- **TensorFlow/Keras**: LSTM neural networks
- **Stable Baselines3**: Reinforcement learning
- **Pandas/NumPy**: Data processing and analysis
- **TA-Lib**: Technical analysis indicators
- **Scikit-learn**: ML utilities and metrics

### External APIs
- **Angel One SmartAPI**: Live trading and market data
- **Alpha Vantage**: Historical data and technical indicators
- **News API**: Financial news and sentiment data

## 📋 Prerequisites

- **Docker & Docker Compose**: For containerized deployment
- **Node.js 18+**: For frontend development
- **Python 3.11+**: For backend development
- **Angel One Account**: For live trading (optional for paper trading)
- **API Keys**: Alpha Vantage, News API

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ai-autonomous-trading-bot/trading-bot
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Angel One API (Required for live trading)
ANGEL_ONE_API_KEY=your_angel_one_api_key
ANGEL_ONE_CLIENT_ID=your_client_id
ANGEL_ONE_PIN=your_trading_pin

# Alpha Vantage API (Required for historical data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# News API (Required for news sentiment)
NEWS_API_KEY=your_news_api_key

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/trading_bot
REDIS_URL=redis://redis:6379

# JWT Secret (Change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URLs
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=http://localhost:8000
```

### 3. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Development Setup

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Database Migration
```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m \"migration message\"
```

## 📚 API Documentation

The API is fully documented with OpenAPI/Swagger. Access the interactive documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

#### Market Data
- `GET /market/live-data` - Get live market data
- `GET /market/historical/{symbol}` - Historical data
- `GET /market/indicators/{symbol}` - Technical indicators
- `POST /market/watchlist` - Add to watchlist

#### Trading
- `GET /trading/positions` - Get current positions
- `GET /trading/trades` - Get trade history
- `POST /trading/place-order` - Place new order
- `GET /trading/portfolio` - Portfolio summary

#### AI Engine
- `GET /ai/signals` - Get AI trading signals
- `POST /ai/train-lstm` - Train LSTM model
- `POST /ai/train-rl` - Train RL agent
- `GET /ai/model-performance` - Model metrics

#### News & Sentiment
- `GET /news` - Get latest news
- `GET /news/sentiment` - Sentiment analysis
- `POST /news/analyze-sentiment/{id}` - Analyze article

## 🤖 AI Models

### LSTM Price Prediction
- **Architecture**: Multi-layer LSTM with dropout
- **Features**: OHLCV data, technical indicators
- **Training**: Daily retraining with latest data
- **Output**: Price predictions with confidence scores

### Reinforcement Learning Agent
- **Algorithm**: PPO (Proximal Policy Optimization)
- **Environment**: Custom trading environment
- **Actions**: Buy, Sell, Hold with position sizing
- **Rewards**: Based on profit/loss and risk metrics

### Technical Indicators
- Moving Averages (SMA, EMA)
- Momentum (RSI, MACD, Stochastic)
- Volatility (Bollinger Bands, ATR)
- Volume (OBV, Volume SMA)
- Trend (ADX, Parabolic SAR)

## 📊 Dashboard Features

### Main Dashboard
- Portfolio overview with real-time P&L
- Top gainers/losers
- Market overview
- Recent trades and positions
- AI signal summary

### Live Feed
- Real-time price updates
- Interactive charts with indicators
- Order book and trade execution
- Watchlist management

### Strategy Lab
- Strategy builder with drag-drop interface
- Backtesting with historical data
- Performance metrics and analysis
- Strategy optimization tools

### AI Monitor
- Model performance tracking
- Signal generation monitoring
- Training progress and logs
- Prediction accuracy metrics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API call throttling
- **Input Validation**: Comprehensive data validation
- **HTTPS**: SSL/TLS encryption (production)
- **API Key Management**: Secure credential storage
- **Session Management**: Redis-based sessions

## 📈 Trading Modes

### Paper Trading
- Risk-free trading simulation
- Real market data with virtual money
- Perfect for testing strategies
- No real money involved

### Live Trading
- Real money trading via Angel One
- Automatic order execution
- Risk management controls
- Position size limits

## 🔧 Configuration

### Trading Settings
```python
# Risk management
MAX_POSITION_SIZE = 10000  # Maximum position value
STOP_LOSS_PERCENTAGE = 5   # Auto stop-loss %
TAKE_PROFIT_PERCENTAGE = 10 # Auto take-profit %

# AI Model settings
LSTM_CONFIDENCE_THRESHOLD = 0.7
RL_CONFIDENCE_THRESHOLD = 0.6
MAX_DAILY_TRADES = 10
```

### Market Data Settings
```python
# Data refresh intervals
LIVE_DATA_INTERVAL = 1     # seconds
INDICATOR_UPDATE_INTERVAL = 60  # seconds
NEWS_FETCH_INTERVAL = 300  # seconds
```

## 🚀 Deployment

### Production Deployment
1. **Server Setup**: Ubuntu 20.04+ with Docker
2. **Domain & SSL**: Configure domain with SSL certificate
3. **Environment**: Set production environment variables
4. **Database**: PostgreSQL with backups
5. **Monitoring**: Set up logging and monitoring
6. **Scaling**: Use Docker Swarm or Kubernetes

### Environment Variables (Production)
```env
# Production settings
ENVIRONMENT=production
DEBUG=False
JWT_SECRET=your-production-jwt-secret
DATABASE_URL=postgresql://user:pass@prod-db:5432/trading_bot

# API Keys (secure storage recommended)
ANGEL_ONE_API_KEY=prod_api_key
ALPHA_VANTAGE_API_KEY=prod_alpha_key
NEWS_API_KEY=prod_news_key
```

## 📊 Monitoring & Logging

### Application Monitoring
- Health check endpoints
- Performance metrics
- Error tracking and alerts
- API usage monitoring

### Trading Monitoring
- Portfolio performance tracking
- Trade execution monitoring
- AI model performance metrics
- Risk exposure alerts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

**IMPORTANT**: This trading bot is for educational and research purposes. Trading involves substantial risk and may not be suitable for all investors. Past performance does not guarantee future results. Always do your own research and consider consulting with a financial advisor before making investment decisions.

## 🆘 Support

For support, email support@example.com or join our Slack channel.

## 📚 Additional Resources

- [Angel One API Documentation](https://smartapi.angelbroking.com/)
- [Alpha Vantage API](https://www.alphavantage.co/documentation/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TensorFlow Documentation](https://www.tensorflow.org/guide)

---

**Happy Trading! 📈**
