#!/bin/bash

# AI Trading Bot Startup Script
echo "🤖 Starting AI-Powered Autonomous Trading Bot..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before continuing."
    echo "💡 You need to set up:"
    echo "   - Angel One API credentials (for live trading)"
    echo "   - Alpha Vantage API key (for market data)"
    echo "   - News API key (for sentiment analysis)"
    echo ""
    echo "🔗 Get API keys from:"
    echo "   - Angel One: https://smartapi.angelbroking.com/"
    echo "   - Alpha Vantage: https://www.alphavantage.co/support/#api-key"
    echo "   - News API: https://newsapi.org/register"
    echo ""
    read -p "Press Enter to continue with default setup (paper trading only)..."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/models
mkdir -p frontend/build

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose pull

# Build and start services
echo "🚀 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

# Check Backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is ready"
else
    echo "⏳ Backend API is starting..."
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready"
else
    echo "⏳ Frontend is starting..."
fi

echo ""
echo "🎉 AI Trading Bot is starting up!"
echo ""
echo "📊 Access your trading dashboard:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📋 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the bot:"
echo "   docker-compose down"
echo ""
echo "📚 Check README.md for detailed setup instructions"
echo ""
echo "⚠️  IMPORTANT: This is for educational purposes only."
echo "   Always test with paper trading before going live!"
echo ""

# Show container status
echo "📦 Container Status:"
docker-compose ps
