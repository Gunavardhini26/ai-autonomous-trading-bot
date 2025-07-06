"""
Advanced Portfolio Management System
Implements automated portfolio optimization, rebalancing, and strategy execution
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from enum import Enum
import asyncio
from scipy.optimize import minimize
import cvxpy as cp
from ai.advanced_engine import ai_engine, TradingSignal
from ai.risk_manager import risk_manager, RiskMetrics, PositionRisk
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class PortfolioStrategy(Enum):
    AGGRESSIVE_GROWTH = "aggressive_growth"
    BALANCED_GROWTH = "balanced_growth"
    CONSERVATIVE = "conservative"
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    MULTI_FACTOR = "multi_factor"
    AI_DRIVEN = "ai_driven"

class RebalanceFrequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    THRESHOLD_BASED = "threshold_based"

@dataclass
class PortfolioAllocation:
    """Portfolio allocation with targets and constraints"""
    target_weights: Dict[str, float]
    current_weights: Dict[str, float]
    min_weights: Dict[str, float]
    max_weights: Dict[str, float]
    rebalance_threshold: float
    last_rebalance: datetime
    performance_since_rebalance: float

@dataclass
class TradingOrder:
    """Trading order with execution details"""
    symbol: str
    action: str  # BUY, SELL
    quantity: float
    order_type: str  # MARKET, LIMIT, STOP
    price: Optional[float]
    stop_loss: Optional[float]
    take_profit: Optional[float]
    priority: int  # 1-10, higher = more urgent
    reason: str
    timestamp: datetime
    expected_execution_time: datetime

@dataclass
class PortfolioPerformance:
    """Portfolio performance metrics"""
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    profit_factor: float
    calmar_ratio: float
    information_ratio: float
    tracking_error: float
    alpha: float
    beta: float
    total_trades: int
    successful_trades: int

class AdvancedPortfolioManager:
    """Advanced portfolio management system"""
    
    def __init__(
        self, 
        initial_capital: float = 100000,
        strategy: PortfolioStrategy = PortfolioStrategy.AI_DRIVEN,
        rebalance_frequency: RebalanceFrequency = RebalanceFrequency.WEEKLY
    ):
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.strategy = strategy
        self.rebalance_frequency = rebalance_frequency
        
        self.portfolio = {}  # Current positions
        self.allocation = None
        self.pending_orders = []
        self.executed_trades = []
        self.performance_history = []
        
        self.universe = []  # Trading universe
        self.blacklist = set()  # Blacklisted assets
        
    async def initialize_portfolio(self, universe: List[str]):
        """Initialize portfolio with trading universe"""
        self.universe = universe
        logger.info(f"Portfolio initialized with {len(universe)} assets")
        
    async def optimize_portfolio(
        self, 
        price_data: Dict[str, pd.DataFrame],
        expected_returns: Optional[Dict[str, float]] = None,
        risk_model: str = "historical"
    ) -> PortfolioAllocation:
        """Optimize portfolio allocation using advanced techniques"""
        
        try:
            if not price_data:
                return self._create_equal_weight_allocation()
                
            # Calculate expected returns if not provided
            if expected_returns is None:
                expected_returns = await self._estimate_expected_returns(price_data)
                
            # Calculate covariance matrix
            covariance_matrix = await self._calculate_covariance_matrix(price_data, risk_model)
            
            # Optimize based on strategy
            if self.strategy == PortfolioStrategy.AI_DRIVEN:
                target_weights = await self._ai_driven_optimization(price_data, expected_returns, covariance_matrix)
            elif self.strategy == PortfolioStrategy.MOMENTUM:
                target_weights = await self._momentum_optimization(price_data, expected_returns, covariance_matrix)
            elif self.strategy == PortfolioStrategy.MEAN_REVERSION:
                target_weights = await self._mean_reversion_optimization(price_data, expected_returns, covariance_matrix)
            else:
                target_weights = await self._mean_variance_optimization(expected_returns, covariance_matrix)
                
            # Calculate current weights
            current_weights = self._calculate_current_weights()
            
            # Set constraints
            min_weights = {symbol: 0.0 for symbol in self.universe}
            max_weights = {symbol: 0.3 for symbol in self.universe}  # Max 30% per asset
            
            self.allocation = PortfolioAllocation(
                target_weights=target_weights,
                current_weights=current_weights,
                min_weights=min_weights,
                max_weights=max_weights,
                rebalance_threshold=0.05,  # 5% threshold
                last_rebalance=datetime.now(),
                performance_since_rebalance=0.0
            )
            
            return self.allocation
            
        except Exception as e:
            logger.error(f"Portfolio optimization error: {e}")
            return self._create_equal_weight_allocation()
            
    async def _estimate_expected_returns(self, price_data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
        """Estimate expected returns using multiple methods"""
        
        expected_returns = {}
        
        for symbol, data in price_data.items():
            if len(data) < 10:
                expected_returns[symbol] = 0.08  # Default 8% annual return
                continue
                
            returns = data['close'].pct_change().dropna()
            
            # Historical mean
            historical_mean = returns.mean() * 252
            
            # Exponentially weighted mean (more weight on recent data)
            ewm_mean = returns.ewm(span=30).mean().iloc[-1] * 252
            
            # Get AI prediction if available
            try:
                predictions = await ai_engine.predict_market_direction(data)
                ai_prediction = np.mean(list(predictions.values())) if predictions else 0.5
                ai_expected_return = (ai_prediction - 0.5) * 0.4  # Convert to expected return
            except:
                ai_expected_return = 0.0
                
            # Combine methods
            expected_return = (
                historical_mean * 0.3 +
                ewm_mean * 0.4 +
                ai_expected_return * 0.3
            )
            
            expected_returns[symbol] = max(-0.5, min(0.5, expected_return))  # Cap at ±50%
            
        return expected_returns
        
    async def _calculate_covariance_matrix(
        self, 
        price_data: Dict[str, pd.DataFrame], 
        risk_model: str = "historical"
    ) -> np.ndarray:
        """Calculate covariance matrix using various risk models"""
        
        # Prepare returns data
        returns_data = {}
        for symbol, data in price_data.items():
            if len(data) > 1:
                returns_data[symbol] = data['close'].pct_change().dropna()
                
        returns_df = pd.DataFrame(returns_data).fillna(0)
        
        if risk_model == "historical":
            # Simple historical covariance
            cov_matrix = returns_df.cov().values * 252
        elif risk_model == "ewma":
            # Exponentially weighted moving average
            cov_matrix = returns_df.ewm(span=60).cov().iloc[-len(returns_df.columns):].values * 252
        elif risk_model == "shrinkage":
            # Ledoit-Wolf shrinkage estimator
            sample_cov = returns_df.cov().values * 252
            n_assets = len(sample_cov)
            
            # Shrinkage target (identity matrix scaled by average variance)
            avg_var = np.trace(sample_cov) / n_assets
            target = np.eye(n_assets) * avg_var
            
            # Simple shrinkage intensity
            shrinkage_intensity = 0.2
            cov_matrix = (1 - shrinkage_intensity) * sample_cov + shrinkage_intensity * target
        else:
            cov_matrix = returns_df.cov().values * 252
            
        # Ensure positive definiteness
        eigenvals, eigenvecs = np.linalg.eigh(cov_matrix)
        eigenvals = np.maximum(eigenvals, 1e-8)
        cov_matrix = eigenvecs @ np.diag(eigenvals) @ eigenvecs.T
        
        return cov_matrix
        
    async def _ai_driven_optimization(
        self,
        price_data: Dict[str, pd.DataFrame],
        expected_returns: Dict[str, float],
        covariance_matrix: np.ndarray
    ) -> Dict[str, float]:
        """AI-driven portfolio optimization"""
        
        try:
            # Get AI signals for each asset
            ai_scores = {}
            for symbol, data in price_data.items():
                try:
                    signal = await ai_engine.generate_trading_signal(data)
                    # Convert signal to score (-1 to 1)
                    if signal.action == 'BUY':
                        ai_scores[symbol] = signal.confidence
                    elif signal.action == 'SELL':
                        ai_scores[symbol] = -signal.confidence
                    else:
                        ai_scores[symbol] = 0.0
                except:
                    ai_scores[symbol] = 0.0
                    
            # Combine AI scores with expected returns
            symbols = list(expected_returns.keys())
            combined_scores = np.array([
                expected_returns[symbol] + ai_scores.get(symbol, 0.0) * 0.2
                for symbol in symbols
            ])
            
            # Optimization with constraints
            n_assets = len(symbols)
            weights = cp.Variable(n_assets)
            
            # Objective: maximize AI-adjusted expected return - risk penalty
            portfolio_return = weights.T @ combined_scores
            portfolio_risk = cp.quad_form(weights, covariance_matrix)
            
            # Risk aversion parameter
            risk_aversion = 3.0
            objective = cp.Maximize(portfolio_return - risk_aversion * portfolio_risk)
            
            # Constraints
            constraints = [
                cp.sum(weights) == 1,  # Fully invested
                weights >= 0,  # Long-only
                weights <= 0.3,  # Max 30% per asset
            ]
            
            # Solve optimization
            problem = cp.Problem(objective, constraints)
            problem.solve(solver=cp.ECOS, verbose=False)
            
            if weights.value is not None:
                optimal_weights = {symbols[i]: max(0, float(weights.value[i])) for i in range(n_assets)}
                # Normalize weights
                total_weight = sum(optimal_weights.values())
                if total_weight > 0:
                    optimal_weights = {k: v/total_weight for k, v in optimal_weights.items()}
                return optimal_weights
                
        except Exception as e:
            logger.error(f"AI optimization error: {e}")
            
        # Fallback to equal weight
        return self._create_equal_weight_allocation().target_weights
        
    async def _momentum_optimization(
        self,
        price_data: Dict[str, pd.DataFrame],
        expected_returns: Dict[str, float],
        covariance_matrix: np.ndarray
    ) -> Dict[str, float]:
        """Momentum-based portfolio optimization"""
        
        momentum_scores = {}
        
        for symbol, data in price_data.items():
            if len(data) >= 252:  # Need at least 1 year of data
                # Calculate momentum metrics
                returns_1m = (data['close'].iloc[-21] / data['close'].iloc[-42] - 1)
                returns_3m = (data['close'].iloc[-63] / data['close'].iloc[-126] - 1)
                returns_6m = (data['close'].iloc[-126] / data['close'].iloc[-189] - 1)
                returns_12m = (data['close'].iloc[-252] / data['close'].iloc[-1] - 1)
                
                # Weighted momentum score
                momentum_score = (
                    returns_1m * 0.1 +
                    returns_3m * 0.2 +
                    returns_6m * 0.3 +
                    returns_12m * 0.4
                )
                momentum_scores[symbol] = momentum_score
            else:
                momentum_scores[symbol] = 0.0
                
        # Rank assets by momentum and allocate weights
        sorted_assets = sorted(momentum_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Top quartile gets higher allocation
        n_assets = len(sorted_assets)
        top_quartile = n_assets // 4
        
        weights = {}
        for i, (symbol, score) in enumerate(sorted_assets):
            if i < top_quartile:
                weights[symbol] = 0.6 / top_quartile  # 60% to top quartile
            else:
                weights[symbol] = 0.4 / (n_assets - top_quartile)  # 40% to rest
                
        return weights
        
    async def _mean_reversion_optimization(
        self,
        price_data: Dict[str, pd.DataFrame],
        expected_returns: Dict[str, float],
        covariance_matrix: np.ndarray
    ) -> Dict[str, float]:
        """Mean reversion-based portfolio optimization"""
        
        reversion_scores = {}
        
        for symbol, data in price_data.items():
            if len(data) >= 63:  # Need at least 3 months of data
                # Calculate mean reversion metrics
                current_price = data['close'].iloc[-1]
                ma_20 = data['close'].iloc[-20:].mean()
                ma_50 = data['close'].iloc[-50:].mean()
                
                # Distance from moving averages (negative = undervalued)
                deviation_20 = (current_price - ma_20) / ma_20
                deviation_50 = (current_price - ma_50) / ma_50
                
                # Mean reversion score (higher = more undervalued)
                reversion_score = -(deviation_20 * 0.6 + deviation_50 * 0.4)
                reversion_scores[symbol] = reversion_score
            else:
                reversion_scores[symbol] = 0.0
                
        # Allocate more to undervalued assets
        min_score = min(reversion_scores.values())
        max_score = max(reversion_scores.values())
        
        if max_score > min_score:
            normalized_scores = {
                symbol: (score - min_score) / (max_score - min_score)
                for symbol, score in reversion_scores.items()
            }
        else:
            normalized_scores = {symbol: 1/len(reversion_scores) for symbol in reversion_scores}
            
        # Normalize to sum to 1
        total_score = sum(normalized_scores.values())
        weights = {symbol: score/total_score for symbol, score in normalized_scores.items()}
        
        return weights
        
    async def _mean_variance_optimization(
        self,
        expected_returns: Dict[str, float],
        covariance_matrix: np.ndarray
    ) -> Dict[str, float]:
        """Classical mean-variance optimization"""
        
        try:
            symbols = list(expected_returns.keys())
            n_assets = len(symbols)
            
            # Convert to arrays
            mu = np.array([expected_returns[symbol] for symbol in symbols])
            
            # Optimization variables
            weights = cp.Variable(n_assets)
            
            # Objective: maximize Sharpe ratio
            portfolio_return = weights.T @ mu
            portfolio_risk = cp.quad_form(weights, covariance_matrix)
            
            # Risk aversion parameter
            risk_aversion = 2.0
            objective = cp.Maximize(portfolio_return - risk_aversion * portfolio_risk)
            
            # Constraints
            constraints = [
                cp.sum(weights) == 1,
                weights >= 0,
                weights <= 0.3
            ]
            
            # Solve
            problem = cp.Problem(objective, constraints)
            problem.solve(solver=cp.ECOS, verbose=False)
            
            if weights.value is not None:
                optimal_weights = {symbols[i]: max(0, float(weights.value[i])) for i in range(n_assets)}
                return optimal_weights
                
        except Exception as e:
            logger.error(f"Mean-variance optimization error: {e}")
            
        # Fallback
        n_assets = len(expected_returns)
        equal_weight = 1.0 / n_assets
        return {symbol: equal_weight for symbol in expected_returns.keys()}
        
    def _calculate_current_weights(self) -> Dict[str, float]:
        """Calculate current portfolio weights"""
        
        if not self.portfolio:
            return {symbol: 0.0 for symbol in self.universe}
            
        total_value = sum(abs(value) for value in self.portfolio.values())
        
        if total_value == 0:
            return {symbol: 0.0 for symbol in self.universe}
            
        current_weights = {}
        for symbol in self.universe:
            current_weights[symbol] = self.portfolio.get(symbol, 0.0) / total_value
            
        return current_weights
        
    def _create_equal_weight_allocation(self) -> PortfolioAllocation:
        """Create equal weight allocation as fallback"""
        
        n_assets = len(self.universe)
        equal_weight = 1.0 / n_assets if n_assets > 0 else 0.0
        
        target_weights = {symbol: equal_weight for symbol in self.universe}
        current_weights = self._calculate_current_weights()
        min_weights = {symbol: 0.0 for symbol in self.universe}
        max_weights = {symbol: 0.3 for symbol in self.universe}
        
        return PortfolioAllocation(
            target_weights=target_weights,
            current_weights=current_weights,
            min_weights=min_weights,
            max_weights=max_weights,
            rebalance_threshold=0.05,
            last_rebalance=datetime.now(),
            performance_since_rebalance=0.0
        )
        
    async def generate_rebalancing_orders(
        self,
        current_prices: Dict[str, float]
    ) -> List[TradingOrder]:
        """Generate orders to rebalance portfolio to target allocation"""
        
        if not self.allocation:
            return []
            
        orders = []
        current_weights = self._calculate_current_weights()
        
        # Calculate required trades
        for symbol in self.universe:
            target_weight = self.allocation.target_weights.get(symbol, 0.0)
            current_weight = current_weights.get(symbol, 0.0)
            weight_diff = target_weight - current_weight
            
            # Check if rebalancing is needed
            if abs(weight_diff) > self.allocation.rebalance_threshold:
                current_price = current_prices.get(symbol, 0.0)
                if current_price > 0:
                    target_value = target_weight * self.current_capital
                    current_value = current_weight * self.current_capital
                    trade_value = target_value - current_value
                    quantity = trade_value / current_price
                    
                    if abs(quantity) > 0.001:  # Minimum trade size
                        action = "BUY" if quantity > 0 else "SELL"
                        
                        order = TradingOrder(
                            symbol=symbol,
                            action=action,
                            quantity=abs(quantity),
                            order_type="MARKET",
                            price=current_price,
                            stop_loss=None,
                            take_profit=None,
                            priority=5,
                            reason=f"Rebalancing: target {target_weight:.3f}, current {current_weight:.3f}",
                            timestamp=datetime.now(),
                            expected_execution_time=datetime.now() + timedelta(minutes=5)
                        )
                        orders.append(order)
                        
        return orders
        
    async def generate_tactical_orders(
        self,
        price_data: Dict[str, pd.DataFrame],
        current_prices: Dict[str, float]
    ) -> List[TradingOrder]:
        """Generate tactical trading orders based on AI signals"""
        
        orders = []
        
        for symbol in self.universe:
            if symbol in price_data and symbol in current_prices:
                try:
                    # Get AI trading signal
                    signal = await ai_engine.generate_trading_signal(price_data[symbol])
                    
                    if signal.confidence > 0.7:  # High confidence threshold
                        current_price = current_prices[symbol]
                        
                        # Calculate position size based on signal and risk
                        volatility = price_data[symbol]['close'].pct_change().std()
                        position_size = await risk_manager.calculate_position_size(
                            symbol, current_price, self.current_capital, volatility, signal.confidence
                        )
                        
                        if position_size > 0:
                            # Calculate stop loss and take profit
                            stop_loss, take_profit = await risk_manager.calculate_stop_loss_take_profit(
                                symbol, current_price, signal.action, volatility, signal.confidence
                            )
                            
                            order = TradingOrder(
                                symbol=symbol,
                                action=signal.action,
                                quantity=position_size,
                                order_type="LIMIT",
                                price=current_price,
                                stop_loss=stop_loss,
                                take_profit=take_profit,
                                priority=int(signal.confidence * 10),
                                reason=f"AI Signal: {signal.reasoning}",
                                timestamp=datetime.now(),
                                expected_execution_time=datetime.now() + timedelta(minutes=1)
                            )
                            orders.append(order)
                            
                except Exception as e:
                    logger.error(f"Error generating tactical order for {symbol}: {e}")
                    
        return orders
        
    async def execute_orders(self, orders: List[TradingOrder]) -> List[Dict[str, Any]]:
        """Execute trading orders (simulation for now)"""
        
        executed_trades = []
        
        # Sort orders by priority
        orders.sort(key=lambda x: x.priority, reverse=True)
        
        for order in orders:
            try:
                # Simulate order execution
                execution_price = order.price
                execution_time = datetime.now()
                
                # Update portfolio
                if order.action == "BUY":
                    self.portfolio[order.symbol] = self.portfolio.get(order.symbol, 0.0) + order.quantity
                    cost = order.quantity * execution_price
                    self.current_capital -= cost
                else:  # SELL
                    self.portfolio[order.symbol] = self.portfolio.get(order.symbol, 0.0) - order.quantity
                    proceeds = order.quantity * execution_price
                    self.current_capital += proceeds
                    
                # Record trade
                trade_record = {
                    'symbol': order.symbol,
                    'action': order.action,
                    'quantity': order.quantity,
                    'price': execution_price,
                    'timestamp': execution_time,
                    'reason': order.reason,
                    'stop_loss': order.stop_loss,
                    'take_profit': order.take_profit
                }
                
                executed_trades.append(trade_record)
                self.executed_trades.append(trade_record)
                
                logger.info(f"Executed {order.action} {order.quantity:.4f} {order.symbol} at {execution_price:.4f}")
                
            except Exception as e:
                logger.error(f"Error executing order {order.symbol}: {e}")
                
        return executed_trades
        
    async def calculate_performance(
        self,
        price_data: Dict[str, pd.DataFrame],
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> PortfolioPerformance:
        """Calculate comprehensive portfolio performance metrics"""
        
        try:
            if not self.executed_trades:
                return self._default_performance()
                
            # Calculate portfolio returns
            portfolio_values = []
            dates = []
            
            # Simulate portfolio value over time based on trades
            current_positions = {}
            current_cash = self.initial_capital
            
            for trade in self.executed_trades:
                symbol = trade['symbol']
                action = trade['action']
                quantity = trade['quantity']
                price = trade['price']
                
                if action == "BUY":
                    current_positions[symbol] = current_positions.get(symbol, 0.0) + quantity
                    current_cash -= quantity * price
                else:
                    current_positions[symbol] = current_positions.get(symbol, 0.0) - quantity
                    current_cash += quantity * price
                    
                # Calculate portfolio value
                portfolio_value = current_cash
                for pos_symbol, pos_quantity in current_positions.items():
                    if pos_symbol in price_data:
                        current_price = price_data[pos_symbol]['close'].iloc[-1]
                        portfolio_value += pos_quantity * current_price
                        
                portfolio_values.append(portfolio_value)
                dates.append(trade['timestamp'])
                
            if len(portfolio_values) < 2:
                return self._default_performance()
                
            # Calculate returns
            portfolio_series = pd.Series(portfolio_values, index=dates)
            returns = portfolio_series.pct_change().dropna()
            
            # Performance metrics
            total_return = (portfolio_values[-1] - self.initial_capital) / self.initial_capital
            
            # Annualized return
            days = (dates[-1] - dates[0]).days
            if days > 0:
                annualized_return = (1 + total_return) ** (365.25 / days) - 1
            else:
                annualized_return = 0.0
                
            # Volatility
            volatility = returns.std() * np.sqrt(252) if len(returns) > 1 else 0.0
            
            # Sharpe ratio
            risk_free_rate = 0.02
            sharpe_ratio = (annualized_return - risk_free_rate) / volatility if volatility > 0 else 0.0
            
            # Maximum drawdown
            cumulative = (1 + returns).cumprod()
            rolling_max = cumulative.expanding().max()
            drawdowns = (cumulative - rolling_max) / rolling_max
            max_drawdown = drawdowns.min()
            
            # Win rate
            positive_returns = returns[returns > 0]
            win_rate = len(positive_returns) / len(returns) if len(returns) > 0 else 0.0
            
            # Profit factor
            gross_profit = positive_returns.sum()
            gross_loss = abs(returns[returns < 0].sum())
            profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
            
            # Calmar ratio
            calmar_ratio = annualized_return / abs(max_drawdown) if max_drawdown < 0 else 0.0
            
            # Other metrics (simplified)
            information_ratio = 0.0
            tracking_error = 0.0
            alpha = 0.0
            beta = 1.0
            
            if benchmark_data is not None and len(benchmark_data) > 1:
                # Calculate vs benchmark if provided
                benchmark_returns = benchmark_data['close'].pct_change().dropna()
                if len(benchmark_returns) > 0:
                    aligned_returns = pd.concat([returns, benchmark_returns], axis=1, join='inner')
                    if len(aligned_returns) > 1:
                        correlation = aligned_returns.corr().iloc[0, 1]
                        portfolio_std = aligned_returns.iloc[:, 0].std()
                        benchmark_std = aligned_returns.iloc[:, 1].std()
                        beta = correlation * (portfolio_std / benchmark_std) if benchmark_std > 0 else 1.0
                        
                        benchmark_annualized = (1 + benchmark_returns.mean()) ** 252 - 1
                        alpha = annualized_return - (risk_free_rate + beta * (benchmark_annualized - risk_free_rate))
            
            return PortfolioPerformance(
                total_return=total_return,
                annualized_return=annualized_return,
                volatility=volatility,
                sharpe_ratio=sharpe_ratio,
                max_drawdown=max_drawdown,
                win_rate=win_rate,
                profit_factor=profit_factor,
                calmar_ratio=calmar_ratio,
                information_ratio=information_ratio,
                tracking_error=tracking_error,
                alpha=alpha,
                beta=beta,
                total_trades=len(self.executed_trades),
                successful_trades=len([t for t in self.executed_trades if t.get('profit', 0) > 0])
            )
            
        except Exception as e:
            logger.error(f"Error calculating performance: {e}")
            return self._default_performance()
            
    def _default_performance(self) -> PortfolioPerformance:
        """Return default performance metrics"""
        return PortfolioPerformance(
            total_return=0.0,
            annualized_return=0.0,
            volatility=0.0,
            sharpe_ratio=0.0,
            max_drawdown=0.0,
            win_rate=0.0,
            profit_factor=1.0,
            calmar_ratio=0.0,
            information_ratio=0.0,
            tracking_error=0.0,
            alpha=0.0,
            beta=1.0,
            total_trades=0,
            successful_trades=0
        )
        
    async def run_portfolio_management_cycle(
        self,
        price_data: Dict[str, pd.DataFrame],
        current_prices: Dict[str, float]
    ) -> Dict[str, Any]:
        """Run complete portfolio management cycle"""
        
        try:
            # 1. Optimize portfolio allocation
            allocation = await self.optimize_portfolio(price_data)
            
            # 2. Generate rebalancing orders
            rebalancing_orders = await self.generate_rebalancing_orders(current_prices)
            
            # 3. Generate tactical orders
            tactical_orders = await self.generate_tactical_orders(price_data, current_prices)
            
            # 4. Combine and prioritize orders
            all_orders = rebalancing_orders + tactical_orders
            
            # 5. Execute orders
            executed_trades = await self.execute_orders(all_orders)
            
            # 6. Calculate performance
            performance = await self.calculate_performance(price_data)
            
            # 7. Calculate portfolio risk
            portfolio_risk = await risk_manager.calculate_portfolio_risk(
                self.portfolio, price_data
            )
            
            return {
                'timestamp': datetime.now(),
                'allocation': allocation,
                'orders_generated': len(all_orders),
                'trades_executed': len(executed_trades),
                'performance': performance,
                'risk_metrics': portfolio_risk,
                'portfolio_value': self.current_capital + sum(
                    quantity * current_prices.get(symbol, 0.0) 
                    for symbol, quantity in self.portfolio.items()
                ),
                'positions': self.portfolio.copy()
            }
            
        except Exception as e:
            logger.error(f"Portfolio management cycle error: {e}")
            return {
                'timestamp': datetime.now(),
                'error': str(e),
                'portfolio_value': self.current_capital
            }

# Global portfolio manager instance
portfolio_manager = AdvancedPortfolioManager()
