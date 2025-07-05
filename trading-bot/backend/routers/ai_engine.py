from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

from db.database import get_db
from db.models import User, AISignal, ModelPerformance
from security.auth import get_current_user
from ai.lstm_model import lstm_manager
from ai.rl_agent import rl_manager
from data.historical_fetch import alpha_vantage_client

router = APIRouter()

# Pydantic models
class TrainingRequest(BaseModel):
    symbol: str
    model_type: str  # "LSTM" or "RL"
    epochs: Optional[int] = 50

class PredictionRequest(BaseModel):
    symbol: str
    steps_ahead: Optional[int] = 1

class ModelPerformanceResponse(BaseModel):
    model_type: str
    symbol: str
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    training_date: str

@router.post("/train/{model_type}")
async def train_model(
    model_type: str,
    request: TrainingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Train AI model (LSTM or RL) for a specific symbol"""
    try:
        if model_type.upper() not in ["LSTM", "RL"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model type must be 'LSTM' or 'RL'"
            )
        
        symbol = request.symbol
        epochs = request.epochs or 50
        
        if model_type.upper() == "LSTM":
            # Train LSTM model
            result = await lstm_manager.train_model(symbol, epochs)
            
            if result.get("success"):
                # Save performance metrics
                performance = ModelPerformance(
                    model_type="LSTM",
                    symbol=symbol,
                    accuracy=result.get("val_rmse"),  # Using RMSE as accuracy metric
                    precision=None,
                    recall=None,
                    f1_score=None,
                    total_profit=None,
                    win_rate=None,
                    sharpe_ratio=None,
                    max_drawdown=None
                )
                db.add(performance)
                db.commit()
                
                return {
                    "success": True,
                    "model_type": "LSTM",
                    "symbol": symbol,
                    "training_results": result,
                    "message": f"LSTM model trained successfully for {symbol}"
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Training failed")
                }
        
        elif model_type.upper() == "RL":
            # Get historical data for RL training
            data_result = await alpha_vantage_client.get_daily_data(symbol, outputsize="full")
            
            if not data_result.get("success"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to fetch historical data for RL training"
                )
            
            # Convert data format for RL agent
            historical_data = []
            for item in data_result["data"]:
                historical_data.append({
                    "timestamp": item["date"],
                    "open": item["open"],
                    "high": item["high"],
                    "low": item["low"],
                    "close": item["close"],
                    "volume": item["volume"]
                })
            
            # Train RL agent
            result = rl_manager.train_agent(symbol, historical_data, episodes=epochs*10)
            
            if result.get("success"):
                # Save performance metrics
                performance = ModelPerformance(
                    model_type="RL",
                    symbol=symbol,
                    accuracy=result.get("win_rate"),
                    precision=None,
                    recall=None,
                    f1_score=None,
                    total_profit=result.get("final_return"),
                    win_rate=result.get("win_rate"),
                    sharpe_ratio=None,
                    max_drawdown=result.get("max_drawdown")
                )
                db.add(performance)
                db.commit()
                
                return {
                    "success": True,
                    "model_type": "RL",
                    "symbol": symbol,
                    "training_results": result,
                    "message": f"RL agent trained successfully for {symbol}"
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Training failed")
                }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}"
        )

@router.post("/predict")
async def get_prediction(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get price predictions from LSTM model"""
    try:
        symbol = request.symbol
        steps_ahead = request.steps_ahead or 1
        
        # Get LSTM prediction
        prediction_result = await lstm_manager.get_predictions(symbol, steps_ahead)
        
        if prediction_result.get("success"):
            # Store signal in database
            ai_signal = AISignal(
                symbol=symbol,
                signal_type="PREDICTION",
                confidence=prediction_result.get("confidence", 0.5),
                lstm_prediction=prediction_result.get("predictions", [None])[0],
                model_version="1.0"
            )
            db.add(ai_signal)
            db.commit()
            
            return {
                "success": True,
                "symbol": symbol,
                "predictions": prediction_result.get("predictions", []),
                "confidence": prediction_result.get("confidence", 0.5),
                "current_price": prediction_result.get("current_price"),
                "steps_ahead": steps_ahead,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "error": prediction_result.get("error", "Prediction failed")
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/trading-signal")
async def get_trading_signal(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get trading signal from RL agent"""
    try:
        symbol = request.symbol
        
        # Get recent historical data for RL signal
        data_result = await alpha_vantage_client.get_intraday_data(symbol, interval="5min")
        
        if not data_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch recent data for trading signal"
            )
        
        # Convert data format
        recent_data = []
        for item in data_result["data"][:100]:  # Last 100 periods
            recent_data.append({
                "timestamp": item["timestamp"],
                "open": item["open"],
                "high": item["high"],
                "low": item["low"],
                "close": item["close"],
                "volume": item["volume"]
            })
        
        # Get RL trading signal
        signal_result = rl_manager.get_trading_signal(symbol, recent_data)
        
        if signal_result.get("success"):
            # Store signal in database
            ai_signal = AISignal(
                symbol=symbol,
                signal_type=signal_result.get("action", "HOLD"),
                confidence=signal_result.get("confidence", 0.5),
                rl_action=signal_result.get("action", "HOLD"),
                model_version="1.0"
            )
            db.add(ai_signal)
            db.commit()
            
            return {
                "success": True,
                "symbol": symbol,
                "signal": signal_result.get("action", "HOLD"),
                "confidence": signal_result.get("confidence", 0.5),
                "q_values": signal_result.get("q_values", []),
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "error": signal_result.get("error", "Signal generation failed")
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trading signal failed: {str(e)}"
        )

@router.get("/models/performance")
async def get_model_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get performance metrics for all trained models"""
    try:
        # Get recent model performance records
        performances = db.query(ModelPerformance).order_by(
            ModelPerformance.training_date.desc()
        ).limit(50).all()
        
        performance_data = []
        for perf in performances:
            performance_data.append({
                "id": perf.id,
                "model_type": perf.model_type,
                "symbol": perf.symbol,
                "accuracy": perf.accuracy,
                "precision": perf.precision,
                "recall": perf.recall,
                "f1_score": perf.f1_score,
                "total_profit": perf.total_profit,
                "win_rate": perf.win_rate,
                "sharpe_ratio": perf.sharpe_ratio,
                "max_drawdown": perf.max_drawdown,
                "training_date": perf.training_date.isoformat()
            })
        
        return {
            "performances": performance_data,
            "total_models": len(performance_data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch model performance: {str(e)}"
        )

@router.get("/signals/recent")
async def get_recent_signals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Get recent AI signals"""
    try:
        signals = db.query(AISignal).order_by(
            AISignal.timestamp.desc()
        ).limit(limit).all()
        
        signal_data = []
        for signal in signals:
            signal_data.append({
                "id": signal.id,
                "symbol": signal.symbol,
                "signal_type": signal.signal_type,
                "confidence": signal.confidence,
                "lstm_prediction": signal.lstm_prediction,
                "rl_action": signal.rl_action,
                "model_version": signal.model_version,
                "timestamp": signal.timestamp.isoformat()
            })
        
        return {
            "signals": signal_data,
            "total_signals": len(signal_data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recent signals: {str(e)}"
        )

@router.get("/models/status")
async def get_models_status(current_user: User = Depends(get_current_user)):
    """Get status of all AI models"""
    try:
        # Check LSTM models
        lstm_models = {}
        sample_symbols = ["RELIANCE", "TCS", "INFY"]
        
        for symbol in sample_symbols:
            model = lstm_manager.get_or_create_model(symbol)
            lstm_models[symbol] = {
                "trained": model.is_trained,
                "model_path": model.model_path
            }
        
        # Check RL agents
        rl_agents = {}
        for symbol in sample_symbols:
            agent = rl_manager.get_or_create_agent(symbol)
            rl_agents[symbol] = {
                "trained": agent.is_trained
            }
        
        return {
            "lstm_models": lstm_models,
            "rl_agents": rl_agents,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get models status: {str(e)}"
        )
