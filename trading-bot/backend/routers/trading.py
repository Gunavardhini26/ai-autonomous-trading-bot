from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

from db.database import get_db
from db.models import User, Trade, Position, OrderType, OrderStatus, TradingMode
from security.auth import get_current_user, check_rate_limit, require_paper_or_live_trading
from broker.angel_one import angel_client
from ai.lstm_model import lstm_manager
from ai.rl_agent import rl_manager

router = APIRouter()

# Pydantic models
class OrderRequest(BaseModel):
    symbol: str
    order_type: str  # "BUY" or "SELL"
    quantity: int
    price: Optional[float] = None  # None for market orders
    order_category: str = "MARKET"  # "MARKET" or "LIMIT"

class OrderResponse(BaseModel):
    success: bool
    order_id: Optional[str] = None
    message: str
    trade_id: Optional[int] = None

class PositionResponse(BaseModel):
    symbol: str
    quantity: int
    avg_price: float
    current_price: float
    pnl: float
    pnl_percent: float

@router.post("/place-order", response_model=OrderResponse)
async def place_order(
    order: OrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Place a trading order"""
    try:
        # Check rate limit
        if not check_rate_limit(current_user.id, "place_order", 10, 60):  # 10 orders per minute
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Order rate limit exceeded"
            )
        
        # Validate trading permissions
        require_paper_or_live_trading(current_user)
        
        # Validate order
        if order.order_type not in ["BUY", "SELL"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order type must be BUY or SELL"
            )
        
        if order.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be positive"
            )
        
        # Get current market price
        if order.order_category == "MARKET" or not order.price:
            quote_result = await angel_client.get_ltp("NSE", order.symbol)
            if not quote_result.get("success"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Unable to get market price"
                )
            order.price = quote_result["data"]["ltp"]
        
        # Calculate order value
        order_value = order.quantity * order.price
        
        # Check balance for paper trading
        if current_user.trading_mode == TradingMode.PAPER:
            if order.order_type == "BUY" and order_value > current_user.paper_balance:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient paper trading balance"
                )
        
        # Create trade record
        new_trade = Trade(
            user_id=current_user.id,
            symbol=order.symbol,
            order_type=OrderType(order.order_type),
            quantity=order.quantity,
            price=order.price,
            order_status=OrderStatus.PENDING,
            trading_mode=current_user.trading_mode
        )
        
        db.add(new_trade)
        db.commit()
        db.refresh(new_trade)
        
        # Execute order based on trading mode
        if current_user.trading_mode == TradingMode.LIVE:
            # Place real order through Angel One
            order_data = {
                "symbol": order.symbol,
                "token": "0",  # You'd need to map symbol to token
                "transaction_type": order.order_type,
                "exchange": "NSE",
                "order_type": order.order_category,
                "quantity": order.quantity,
                "price": order.price if order.order_category == "LIMIT" else "0"
            }
            
            result = await angel_client.place_order(order_data)
            
            if result.get("success"):
                new_trade.angel_order_id = result["order_id"]
                new_trade.order_status = OrderStatus.EXECUTED
                
                # Update user positions for live trading
                await update_position(current_user.id, order.symbol, order.order_type, 
                                    order.quantity, order.price, db)
            else:
                new_trade.order_status = OrderStatus.CANCELLED
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Order execution failed: {result.get('error')}"
                )
        
        else:  # Paper trading
            # Simulate order execution
            new_trade.order_status = OrderStatus.EXECUTED
            
            # Update paper balance
            if order.order_type == "BUY":
                current_user.paper_balance -= order_value
            else:
                current_user.paper_balance += order_value
            
            # Update positions
            await update_position(current_user.id, order.symbol, order.order_type,
                                order.quantity, order.price, db)
        
        db.commit()
        
        return OrderResponse(
            success=True,
            order_id=new_trade.angel_order_id,
            message=f"Order placed successfully in {current_user.trading_mode.value} mode",
            trade_id=new_trade.id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Order placement failed: {str(e)}"
        )

async def update_position(user_id: int, symbol: str, order_type: str, 
                         quantity: int, price: float, db: Session):
    """Update user position after trade execution"""
    try:
        # Get existing position
        position = db.query(Position).filter(
            Position.user_id == user_id,
            Position.symbol == symbol
        ).first()
        
        if not position:
            # Create new position
            if order_type == "BUY":
                new_position = Position(
                    user_id=user_id,
                    symbol=symbol,
                    quantity=quantity,
                    avg_price=price,
                    current_price=price,
                    trading_mode=TradingMode.PAPER  # You'd get this from user
                )
                db.add(new_position)
            # Don't create position for SELL if no existing position
        else:
            # Update existing position
            if order_type == "BUY":
                # Add to position
                total_value = (position.quantity * position.avg_price) + (quantity * price)
                total_quantity = position.quantity + quantity
                position.avg_price = total_value / total_quantity
                position.quantity = total_quantity
            else:  # SELL
                # Reduce position
                position.quantity -= quantity
                if position.quantity <= 0:
                    db.delete(position)
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise e

@router.get("/positions", response_model=List[PositionResponse])
async def get_positions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current positions"""
    try:
        positions = db.query(Position).filter(Position.user_id == current_user.id).all()
        
        position_responses = []
        for position in positions:
            # Get current market price
            try:
                quote_result = await angel_client.get_ltp("NSE", position.symbol)
                current_price = quote_result["data"]["ltp"] if quote_result.get("success") else position.avg_price
            except:
                current_price = position.avg_price
            
            # Calculate PnL
            pnl = (current_price - position.avg_price) * position.quantity
            pnl_percent = ((current_price - position.avg_price) / position.avg_price) * 100
            
            position_responses.append(PositionResponse(
                symbol=position.symbol,
                quantity=position.quantity,
                avg_price=position.avg_price,
                current_price=current_price,
                pnl=pnl,
                pnl_percent=pnl_percent
            ))
        
        return position_responses
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch positions: {str(e)}"
        )

@router.get("/trades")
async def get_trade_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get user's trade history"""
    try:
        trades = db.query(Trade).filter(
            Trade.user_id == current_user.id
        ).order_by(Trade.timestamp.desc()).limit(limit).all()
        
        trade_history = []
        for trade in trades:
            trade_history.append({
                "id": trade.id,
                "symbol": trade.symbol,
                "order_type": trade.order_type.value,
                "quantity": trade.quantity,
                "price": trade.price,
                "order_status": trade.order_status.value,
                "pnl": trade.pnl,
                "trading_mode": trade.trading_mode.value,
                "timestamp": trade.timestamp.isoformat()
            })
        
        return {
            "trades": trade_history,
            "total_trades": len(trade_history),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trade history: {str(e)}"
        )

@router.get("/portfolio")
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio summary and performance"""
    try:
        # Get all positions
        positions = db.query(Position).filter(Position.user_id == current_user.id).all()
        
        total_invested = 0
        current_value = 0
        total_pnl = 0
        
        for position in positions:
            # Get current market price
            try:
                quote_result = await angel_client.get_ltp("NSE", position.symbol)
                current_price = quote_result["data"]["ltp"] if quote_result.get("success") else position.avg_price
            except:
                current_price = position.avg_price
            
            invested = position.avg_price * position.quantity
            current = current_price * position.quantity
            pnl = current - invested
            
            total_invested += invested
            current_value += current
            total_pnl += pnl
        
        # Calculate returns
        total_return_percent = ((current_value - total_invested) / total_invested * 100) if total_invested > 0 else 0
        
        # Get available balance
        available_balance = current_user.paper_balance
        
        return {
            "total_invested": total_invested,
            "current_value": current_value,
            "total_pnl": total_pnl,
            "total_return_percent": total_return_percent,
            "available_balance": available_balance,
            "total_portfolio_value": current_value + available_balance,
            "positions_count": len(positions),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch portfolio summary: {str(e)}"
        )

@router.post("/ai-signal/{symbol}")
async def get_ai_trading_signal(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated trading signal for a symbol"""
    try:
        # Get LSTM prediction
        lstm_result = await lstm_manager.get_predictions(symbol, steps_ahead=1)
        
        # Get RL trading signal (you'd need recent market data)
        # For now, returning placeholder data
        rl_result = {"success": True, "action": "HOLD", "confidence": 0.5}
        
        # Combine signals
        ai_signal = {
            "symbol": symbol,
            "lstm_prediction": lstm_result if lstm_result.get("success") else None,
            "rl_signal": rl_result if rl_result.get("success") else None,
            "combined_recommendation": "HOLD",  # Logic to combine LSTM + RL
            "confidence": 0.5,
            "timestamp": datetime.now().isoformat()
        }
        
        return ai_signal
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI signal: {str(e)}"
        )
