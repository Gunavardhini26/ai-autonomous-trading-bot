#!/usr/bin/env python3
"""
Fast Backend Test and Launcher
"""
import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    
    print("✅ FastAPI imported successfully")
    
    # Create minimal app
    app = FastAPI(title="AI Trading Bot - Fast")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {"status": "running", "message": "AI Trading Bot Fast API"}
    
    @app.get("/api/health")
    async def health():
        return {"status": "healthy"}
    
    if __name__ == "__main__":
        print("🚀 Starting Fast Backend on port 8000...")
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Installing required packages...")
    os.system("pip install fastapi uvicorn")
    print("✅ Packages installed, please run again")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
