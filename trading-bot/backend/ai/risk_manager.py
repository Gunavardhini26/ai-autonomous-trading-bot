"""
Advanced Risk Management System
Implements portfolio risk analysis, position sizing, and risk controls
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from enum import Enum
import asyncio
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    VERY_LOW = "very_low"
    LOW = "low" 
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

@dataclass
class RiskMetrics:
    """Comprehensive risk metrics for a position or portfolio"""
    var_95: float  # Value at Risk (95% confidence)
    var_99: float  # Value at Risk (99% confidence)
    expected_shortfall: float  # Conditional VaR
    max_drawdown: float
    sharpe_ratio: float
    sortino_ratio: float
    beta: float
    volatility: float
    skewness: float
    kurtosis: float
    correlation_to_market: float
    diversification_ratio: float
    concentration_risk: float
    liquidity_risk: float
    overall_risk_score: float
    risk_level: RiskLevel

@dataclass
class PositionRisk:
    """Risk assessment for individual position"""
    symbol: str
    current_price: float
    position_size: float
    position_value: float
    stop_loss: Optional[float]
    take_profit: Optional[float]
    max_position_risk: float
    volatility_risk: float
    liquidity_risk: float
    correlation_risk: float
    time_decay_risk: float
    overall_position_risk: float
    recommended_action: str

@dataclass
class RiskLimits:
    """Risk limits and constraints"""
    max_portfolio_risk: float = 0.02  # 2% max portfolio risk
    max_position_size: float = 0.1    # 10% max position size
    max_correlation: float = 0.7      # Max correlation between positions
    max_drawdown: float = 0.15        # 15% max drawdown
    min_sharpe_ratio: float = 0.5     # Minimum Sharpe ratio
    max_leverage: float = 2.0         # Maximum leverage
    stop_loss_pct: float = 0.02       # 2% stop loss
    take_profit_pct: float = 0.04     # 4% take profit
    max_var_95: float = 0.05          # 5% max VaR

class AdvancedRiskManager:
    """Advanced risk management system"""
    
    def __init__(self, risk_limits: Optional[RiskLimits] = None):
        self.risk_limits = risk_limits or RiskLimits()
        self.portfolio_data = {}
        self.price_history = {}
        self.risk_metrics_history = []
        self.alerts = []
        
    async def calculate_portfolio_risk(
        self, 
        portfolio: Dict[str, float], 
        price_data: Dict[str, pd.DataFrame],
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> RiskMetrics:
        """Calculate comprehensive portfolio risk metrics"""
        
        try:
            # Calculate returns for each asset
            returns_data = {}
            for symbol, data in price_data.items():
                if len(data) > 1:
                    returns_data[symbol] = data['close'].pct_change().dropna()
                    
            if not returns_data:
                return self._default_risk_metrics()
                
            # Create portfolio returns
            portfolio_returns = self._calculate_portfolio_returns(portfolio, returns_data)
            
            if len(portfolio_returns) < 30:  # Need sufficient data
                return self._default_risk_metrics()
                
            # Calculate VaR
            var_95 = np.percentile(portfolio_returns, 5)
            var_99 = np.percentile(portfolio_returns, 1)
            
            # Expected Shortfall (Conditional VaR)
            expected_shortfall = portfolio_returns[portfolio_returns <= var_95].mean()
            
            # Maximum Drawdown
            cumulative_returns = (1 + portfolio_returns).cumprod()
            rolling_max = cumulative_returns.expanding().max()
            drawdowns = (cumulative_returns - rolling_max) / rolling_max
            max_drawdown = drawdowns.min()
            
            # Sharpe Ratio (assuming risk-free rate of 2%)
            risk_free_rate = 0.02 / 252  # Daily risk-free rate
            excess_returns = portfolio_returns - risk_free_rate
            sharpe_ratio = excess_returns.mean() / portfolio_returns.std() * np.sqrt(252)
            
            # Sortino Ratio
            downside_returns = portfolio_returns[portfolio_returns < 0]
            downside_std = downside_returns.std() if len(downside_returns) > 0 else portfolio_returns.std()
            sortino_ratio = excess_returns.mean() / downside_std * np.sqrt(252)
            
            # Beta (if benchmark provided)
            beta = 1.0
            correlation_to_market = 0.0
            if benchmark_data is not None and len(benchmark_data) > 1:
                benchmark_returns = benchmark_data['close'].pct_change().dropna()
                if len(benchmark_returns) > 0:
                    # Align returns
                    aligned_returns = pd.concat([portfolio_returns, benchmark_returns], axis=1, join='inner')
                    if len(aligned_returns) > 1:
                        correlation_to_market = aligned_returns.corr().iloc[0, 1]
                        covariance = aligned_returns.cov().iloc[0, 1]
                        market_variance = aligned_returns.iloc[:, 1].var()
                        beta = covariance / market_variance if market_variance > 0 else 1.0
                        
            # Volatility
            volatility = portfolio_returns.std() * np.sqrt(252)
            
            # Skewness and Kurtosis
            skewness = stats.skew(portfolio_returns)
            kurtosis = stats.kurtosis(portfolio_returns)
            
            # Diversification metrics
            diversification_ratio = self._calculate_diversification_ratio(portfolio, returns_data)
            concentration_risk = self._calculate_concentration_risk(portfolio)
            
            # Liquidity risk (simplified)
            liquidity_risk = self._calculate_liquidity_risk(portfolio, price_data)
            
            # Overall risk score
            overall_risk_score = self._calculate_overall_risk_score(
                abs(var_95), abs(max_drawdown), volatility, concentration_risk, liquidity_risk
            )
            
            # Risk level classification
            risk_level = self._classify_risk_level(overall_risk_score)
            
            return RiskMetrics(
                var_95=var_95,
                var_99=var_99,
                expected_shortfall=expected_shortfall,
                max_drawdown=max_drawdown,
                sharpe_ratio=sharpe_ratio,
                sortino_ratio=sortino_ratio,
                beta=beta,
                volatility=volatility,
                skewness=skewness,
                kurtosis=kurtosis,
                correlation_to_market=correlation_to_market,
                diversification_ratio=diversification_ratio,
                concentration_risk=concentration_risk,
                liquidity_risk=liquidity_risk,
                overall_risk_score=overall_risk_score,
                risk_level=risk_level
            )
            
        except Exception as e:
            logger.error(f"Error calculating portfolio risk: {e}")
            return self._default_risk_metrics()
            
    def _calculate_portfolio_returns(
        self, 
        portfolio: Dict[str, float], 
        returns_data: Dict[str, pd.Series]
    ) -> pd.Series:
        """Calculate portfolio returns from individual asset returns"""
        
        # Normalize portfolio weights
        total_weight = sum(portfolio.values())
        if total_weight == 0:
            return pd.Series()
            
        weights = {k: v/total_weight for k, v in portfolio.items()}
        
        # Align all return series
        returns_df = pd.DataFrame(returns_data)
        returns_df = returns_df.fillna(0)
        
        # Calculate weighted portfolio returns
        portfolio_returns = pd.Series(0.0, index=returns_df.index)
        for symbol, weight in weights.items():
            if symbol in returns_df.columns:
                portfolio_returns += weight * returns_df[symbol]
                
        return portfolio_returns.dropna()
        
    def _calculate_diversification_ratio(
        self, 
        portfolio: Dict[str, float], 
        returns_data: Dict[str, pd.Series]
    ) -> float:
        """Calculate portfolio diversification ratio"""
        
        try:
            if len(portfolio) <= 1:
                return 0.0
                
            # Create correlation matrix
            returns_df = pd.DataFrame(returns_data)
            correlation_matrix = returns_df.corr()
            
            # Calculate average correlation
            n_assets = len(correlation_matrix)
            if n_assets <= 1:
                return 0.0
                
            # Sum of all correlations excluding diagonal
            total_correlation = correlation_matrix.sum().sum() - n_assets
            avg_correlation = total_correlation / (n_assets * (n_assets - 1))
            
            # Diversification ratio (lower correlation = better diversification)
            diversification_ratio = 1 - abs(avg_correlation)
            return max(0.0, min(1.0, diversification_ratio))
            
        except Exception as e:
            logger.error(f"Error calculating diversification ratio: {e}")
            return 0.5
            
    def _calculate_concentration_risk(self, portfolio: Dict[str, float]) -> float:
        """Calculate portfolio concentration risk using Herfindahl index"""
        
        if not portfolio:
            return 1.0
            
        total_value = sum(portfolio.values())
        if total_value == 0:
            return 1.0
            
        # Calculate Herfindahl index
        weights = [v/total_value for v in portfolio.values()]
        herfindahl_index = sum(w**2 for w in weights)
        
        # Normalize to 0-1 scale (1 = high concentration, 0 = low concentration)
        n_assets = len(portfolio)
        min_herfindahl = 1.0 / n_assets  # Perfectly diversified
        max_herfindahl = 1.0  # All in one asset
        
        if max_herfindahl == min_herfindahl:
            return 0.0
            
        concentration_risk = (herfindahl_index - min_herfindahl) / (max_herfindahl - min_herfindahl)
        return max(0.0, min(1.0, concentration_risk))
        
    def _calculate_liquidity_risk(
        self, 
        portfolio: Dict[str, float], 
        price_data: Dict[str, pd.DataFrame]
    ) -> float:
        """Calculate portfolio liquidity risk"""
        
        total_liquidity_risk = 0.0
        total_weight = sum(portfolio.values())
        
        if total_weight == 0:
            return 0.5
            
        for symbol, weight in portfolio.items():
            if symbol in price_data:
                data = price_data[symbol]
                if len(data) > 1:
                    # Use volume and spread as liquidity indicators
                    avg_volume = data['volume'].mean() if 'volume' in data.columns else 1000000
                    
                    # Simple liquidity risk calculation
                    # Higher volume = lower risk
                    volume_risk = 1 / (1 + np.log10(max(avg_volume, 1)))
                    
                    # Price volatility as liquidity indicator
                    price_volatility = data['close'].pct_change().std()
                    volatility_risk = min(price_volatility * 10, 1.0)
                    
                    asset_liquidity_risk = (volume_risk + volatility_risk) / 2
                    total_liquidity_risk += (weight / total_weight) * asset_liquidity_risk
                    
        return min(1.0, max(0.0, total_liquidity_risk))
        
    def _calculate_overall_risk_score(
        self, 
        var_95: float, 
        max_drawdown: float, 
        volatility: float, 
        concentration_risk: float, 
        liquidity_risk: float
    ) -> float:
        """Calculate overall risk score from 0 (low risk) to 1 (high risk)"""
        
        # Normalize individual risk components
        var_risk = min(abs(var_95) * 10, 1.0)  # VaR up to 10%
        drawdown_risk = min(abs(max_drawdown) * 5, 1.0)  # Drawdown up to 20%
        vol_risk = min(volatility * 2, 1.0)  # Volatility up to 50%
        
        # Weighted combination
        overall_risk = (
            var_risk * 0.25 +
            drawdown_risk * 0.25 +
            vol_risk * 0.2 +
            concentration_risk * 0.15 +
            liquidity_risk * 0.15
        )
        
        return min(1.0, max(0.0, overall_risk))
        
    def _classify_risk_level(self, risk_score: float) -> RiskLevel:
        """Classify risk level based on risk score"""
        
        if risk_score < 0.2:
            return RiskLevel.VERY_LOW
        elif risk_score < 0.4:
            return RiskLevel.LOW
        elif risk_score < 0.6:
            return RiskLevel.MODERATE
        elif risk_score < 0.8:
            return RiskLevel.HIGH
        else:
            return RiskLevel.VERY_HIGH
            
    def _default_risk_metrics(self) -> RiskMetrics:
        """Return default risk metrics when calculation fails"""
        return RiskMetrics(
            var_95=-0.02,
            var_99=-0.04,
            expected_shortfall=-0.025,
            max_drawdown=-0.1,
            sharpe_ratio=0.0,
            sortino_ratio=0.0,
            beta=1.0,
            volatility=0.2,
            skewness=0.0,
            kurtosis=0.0,
            correlation_to_market=0.0,
            diversification_ratio=0.5,
            concentration_risk=0.5,
            liquidity_risk=0.5,
            overall_risk_score=0.5,
            risk_level=RiskLevel.MODERATE
        )
        
    async def calculate_position_size(
        self,
        symbol: str,
        entry_price: float,
        portfolio_value: float,
        volatility: float,
        confidence: float = 0.5
    ) -> float:
        """Calculate optimal position size using Kelly Criterion and risk constraints"""
        
        try:
            # Kelly Criterion calculation
            win_rate = 0.5 + (confidence - 0.5) * 0.8  # Convert confidence to win rate
            avg_win = 0.02  # 2% average win
            avg_loss = 0.02  # 2% average loss
            
            if avg_loss > 0:
                kelly_fraction = (win_rate * avg_win - (1 - win_rate) * avg_loss) / avg_win
            else:
                kelly_fraction = 0.0
                
            # Apply safety factor to Kelly
            kelly_fraction = max(0.0, min(kelly_fraction * 0.25, 0.1))  # Max 10% Kelly
            
            # Risk-based position sizing
            risk_per_trade = self.risk_limits.max_portfolio_risk
            volatility_adjusted_risk = risk_per_trade / max(volatility, 0.01)
            
            # Position size based on risk
            risk_based_size = volatility_adjusted_risk * portfolio_value / entry_price
            
            # Maximum position size constraint
            max_position_value = portfolio_value * self.risk_limits.max_position_size
            max_position_size = max_position_value / entry_price
            
            # Take minimum of all constraints
            position_size = min(
                kelly_fraction * portfolio_value / entry_price,
                risk_based_size,
                max_position_size
            )
            
            return max(0.0, position_size)
            
        except Exception as e:
            logger.error(f"Error calculating position size: {e}")
            return 0.0
            
    async def calculate_stop_loss_take_profit(
        self,
        symbol: str,
        entry_price: float,
        direction: str,  # 'BUY' or 'SELL'
        volatility: float,
        confidence: float = 0.5
    ) -> Tuple[Optional[float], Optional[float]]:
        """Calculate stop loss and take profit levels"""
        
        try:
            # Base stop loss and take profit percentages
            base_stop_loss = self.risk_limits.stop_loss_pct
            base_take_profit = self.risk_limits.take_profit_pct
            
            # Adjust based on volatility
            volatility_multiplier = max(0.5, min(2.0, volatility / 0.02))
            
            stop_loss_pct = base_stop_loss * volatility_multiplier
            take_profit_pct = base_take_profit * volatility_multiplier
            
            # Adjust based on confidence
            confidence_multiplier = 0.5 + confidence * 0.5
            take_profit_pct *= confidence_multiplier
            
            if direction.upper() == 'BUY':
                stop_loss = entry_price * (1 - stop_loss_pct)
                take_profit = entry_price * (1 + take_profit_pct)
            else:  # SELL
                stop_loss = entry_price * (1 + stop_loss_pct)
                take_profit = entry_price * (1 - take_profit_pct)
                
            return stop_loss, take_profit
            
        except Exception as e:
            logger.error(f"Error calculating stop loss/take profit: {e}")
            return None, None
            
    async def assess_position_risk(
        self,
        symbol: str,
        current_price: float,
        position_size: float,
        entry_price: float,
        price_history: pd.DataFrame
    ) -> PositionRisk:
        """Assess risk for individual position"""
        
        try:
            position_value = position_size * current_price
            
            # Calculate position volatility
            if len(price_history) > 1:
                returns = price_history['close'].pct_change().dropna()
                volatility_risk = returns.std() * np.sqrt(252)
            else:
                volatility_risk = 0.2
                
            # Calculate maximum position risk
            price_change = (current_price - entry_price) / entry_price
            max_position_risk = abs(price_change)
            
            # Simple liquidity risk assessment
            avg_volume = price_history['volume'].mean() if 'volume' in price_history.columns else 1000000
            liquidity_risk = 1 / (1 + np.log10(max(avg_volume, 1)))
            
            # Correlation risk (simplified - would need market data)
            correlation_risk = 0.3  # Placeholder
            
            # Time decay risk (for options/derivatives)
            time_decay_risk = 0.0  # Placeholder for stocks
            
            # Overall position risk
            overall_position_risk = (
                max_position_risk * 0.4 +
                volatility_risk * 0.3 +
                liquidity_risk * 0.2 +
                correlation_risk * 0.1
            )
            
            # Recommended action
            if overall_position_risk > 0.8:
                recommended_action = "REDUCE_POSITION"
            elif overall_position_risk > 0.6:
                recommended_action = "MONITOR_CLOSELY"
            elif overall_position_risk < 0.2:
                recommended_action = "CONSIDER_INCREASE"
            else:
                recommended_action = "HOLD"
                
            # Calculate stop loss and take profit
            direction = 'BUY' if position_size > 0 else 'SELL'
            stop_loss, take_profit = await self.calculate_stop_loss_take_profit(
                symbol, current_price, direction, volatility_risk
            )
            
            return PositionRisk(
                symbol=symbol,
                current_price=current_price,
                position_size=position_size,
                position_value=position_value,
                stop_loss=stop_loss,
                take_profit=take_profit,
                max_position_risk=max_position_risk,
                volatility_risk=volatility_risk,
                liquidity_risk=liquidity_risk,
                correlation_risk=correlation_risk,
                time_decay_risk=time_decay_risk,
                overall_position_risk=overall_position_risk,
                recommended_action=recommended_action
            )
            
        except Exception as e:
            logger.error(f"Error assessing position risk: {e}")
            return PositionRisk(
                symbol=symbol,
                current_price=current_price,
                position_size=position_size,
                position_value=position_size * current_price,
                stop_loss=None,
                take_profit=None,
                max_position_risk=0.5,
                volatility_risk=0.2,
                liquidity_risk=0.3,
                correlation_risk=0.3,
                time_decay_risk=0.0,
                overall_position_risk=0.5,
                recommended_action="MONITOR"
            )
            
    async def check_risk_limits(self, portfolio_risk: RiskMetrics) -> List[str]:
        """Check if portfolio violates any risk limits"""
        
        violations = []
        
        if abs(portfolio_risk.var_95) > self.risk_limits.max_var_95:
            violations.append(f"VaR 95% ({portfolio_risk.var_95:.3f}) exceeds limit ({self.risk_limits.max_var_95:.3f})")
            
        if abs(portfolio_risk.max_drawdown) > self.risk_limits.max_drawdown:
            violations.append(f"Max drawdown ({portfolio_risk.max_drawdown:.3f}) exceeds limit ({self.risk_limits.max_drawdown:.3f})")
            
        if portfolio_risk.sharpe_ratio < self.risk_limits.min_sharpe_ratio:
            violations.append(f"Sharpe ratio ({portfolio_risk.sharpe_ratio:.3f}) below minimum ({self.risk_limits.min_sharpe_ratio:.3f})")
            
        if portfolio_risk.concentration_risk > 0.8:
            violations.append("High concentration risk detected")
            
        if portfolio_risk.liquidity_risk > 0.8:
            violations.append("High liquidity risk detected")
            
        return violations
        
    async def generate_risk_report(
        self,
        portfolio: Dict[str, float],
        price_data: Dict[str, pd.DataFrame],
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> Dict[str, Any]:
        """Generate comprehensive risk report"""
        
        # Calculate portfolio risk
        portfolio_risk = await self.calculate_portfolio_risk(portfolio, price_data, benchmark_data)
        
        # Check risk limit violations
        violations = await self.check_risk_limits(portfolio_risk)
        
        # Calculate individual position risks
        position_risks = []
        for symbol, position_size in portfolio.items():
            if symbol in price_data and position_size != 0:
                current_price = price_data[symbol]['close'].iloc[-1]
                entry_price = current_price  # Simplified - would use actual entry price
                
                position_risk = await self.assess_position_risk(
                    symbol, current_price, position_size, entry_price, price_data[symbol]
                )
                position_risks.append(position_risk)
                
        # Generate recommendations
        recommendations = await self._generate_risk_recommendations(portfolio_risk, position_risks, violations)
        
        return {
            'timestamp': datetime.now(),
            'portfolio_risk': portfolio_risk,
            'position_risks': position_risks,
            'violations': violations,
            'recommendations': recommendations,
            'risk_score': portfolio_risk.overall_risk_score,
            'risk_level': portfolio_risk.risk_level.value
        }
        
    async def _generate_risk_recommendations(
        self,
        portfolio_risk: RiskMetrics,
        position_risks: List[PositionRisk],
        violations: List[str]
    ) -> List[str]:
        """Generate risk management recommendations"""
        
        recommendations = []
        
        # Portfolio-level recommendations
        if portfolio_risk.risk_level == RiskLevel.VERY_HIGH:
            recommendations.append("URGENT: Reduce overall portfolio risk immediately")
        elif portfolio_risk.risk_level == RiskLevel.HIGH:
            recommendations.append("Consider reducing portfolio risk exposure")
            
        if portfolio_risk.concentration_risk > 0.7:
            recommendations.append("Diversify portfolio to reduce concentration risk")
            
        if portfolio_risk.sharpe_ratio < 0.5:
            recommendations.append("Improve risk-adjusted returns or reduce risk")
            
        if abs(portfolio_risk.max_drawdown) > 0.1:
            recommendations.append("Implement stronger drawdown controls")
            
        # Position-level recommendations
        high_risk_positions = [p for p in position_risks if p.overall_position_risk > 0.6]
        if high_risk_positions:
            recommendations.append(f"Review high-risk positions: {[p.symbol for p in high_risk_positions]}")
            
        # Violation-based recommendations
        if violations:
            recommendations.append("Address risk limit violations immediately")
            
        return recommendations

# Global risk manager instance
risk_manager = AdvancedRiskManager()
