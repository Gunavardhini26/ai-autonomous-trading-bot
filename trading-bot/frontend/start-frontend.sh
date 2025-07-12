#!/bin/bash

# AI Trading Bot Frontend Launcher
# This script sets up and runs the frontend development server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Trading Bot Frontend Launcher${NC}"
echo -e "${BLUE}=====================================${NC}"

# Change to frontend directory
cd "$(dirname "$0")"
echo -e "${YELLOW}📁 Current directory: $(pwd)${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if build directory exists, if not create it
if [ ! -d "build" ]; then
    echo -e "${YELLOW}📂 Creating build directory...${NC}"
    mkdir -p build
fi

# Check for TypeScript errors
echo -e "${YELLOW}🔍 Checking TypeScript compilation...${NC}"
npx tsc --noEmit --skipLibCheck || {
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    echo -e "${YELLOW}🔧 Attempting to fix common issues...${NC}"
    
    # Try to install missing types
    npm install --save-dev @types/node @types/react @types/react-dom @types/react-router-dom
    
    echo -e "${GREEN}✅ Additional type definitions installed${NC}"
}

# Set environment variables
export BROWSER=none
export GENERATE_SOURCEMAP=false
export SKIP_PREFLIGHT_CHECK=true

# Start the development server
echo -e "${GREEN}🏃 Starting React development server...${NC}"
echo -e "${BLUE}The app will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

npm start
