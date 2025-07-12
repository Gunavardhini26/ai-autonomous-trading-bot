#!/bin/bash

# AI Trading Bot Backend Launcher
# This script sets up and runs the backend FastAPI server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Trading Bot Backend Launcher${NC}"
echo -e "${BLUE}====================================${NC}"

# Change to backend directory
cd "$(dirname "$0")"
echo -e "${YELLOW}📁 Current directory: $(pwd)${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}🐍 Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pip install -r requirements.txt

# Check for database
echo -e "${YELLOW}🗄️ Setting up database...${NC}"
if [ ! -f "trading_bot.db" ]; then
    echo -e "${YELLOW}📊 Creating database...${NC}"
    python -c "
from db.database import engine, Base
from db import models
Base.metadata.create_all(bind=engine)
print('Database created successfully')
"
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${GREEN}✅ Database already exists${NC}"
fi

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export ENVIRONMENT=development

# Start the FastAPI server
echo -e "${GREEN}🏃 Starting FastAPI server...${NC}"
echo -e "${BLUE}The API will be available at: http://localhost:8000${NC}"
echo -e "${BLUE}API Documentation: http://localhost:8000/docs${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
