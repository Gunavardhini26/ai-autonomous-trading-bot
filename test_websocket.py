#!/usr/bin/env python3
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    
    try:
        print("🔌 Testing WebSocket connection...")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Test 1: Send portfolio request
            test_message = {
                "type": "get_portfolio",
                "timestamp": "2025-07-07T12:00:00Z"
            }
            
            await websocket.send(json.dumps(test_message))
            print(f"📤 Sent: {test_message}")
            
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            
            # Test 2: Send signals request
            test_message2 = {
                "type": "get_signals", 
                "symbols": ["RELIANCE", "TCS", "HDFC"]
            }
            
            await websocket.send(json.dumps(test_message2))
            print(f"📤 Sent: {test_message2}")
            
            response2 = await websocket.recv()
            print(f"📥 Received: {response2}")
            
            print("✅ WebSocket test completed successfully!")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
