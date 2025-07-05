import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam
from collections import deque
import random
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import os
import pickle

from config import RL_LEARNING_RATE, RL_BATCH_SIZE, RL_MEMORY_SIZE

logger = logging.getLogger(__name__)

class TradingEnvironment:
    """Trading environment for reinforcement learning"""
    
    def __init__(self, data: List[Dict], initial_balance: float = 100000):
        self.data = data
        self.initial_balance = initial_balance
        self.reset()
    
    def reset(self):
        """Reset environment to initial state"""
        self.current_step = 0
        self.balance = self.initial_balance
        self.position = 0  # 0 = no position, 1 = long, -1 = short
        self.position_size = 0
        self.entry_price = 0
        self.total_profit = 0
        self.trade_count = 0
        self.winning_trades = 0
        self.max_drawdown = 0
        self.peak_balance = self.initial_balance
        
        return self._get_state()
    
    def _get_state(self) -> np.ndarray:
        """Get current state representation"""
        if self.current_step >= len(self.data):
            return np.zeros(15)  # Return zero state if out of data
        
        current_data = self.data[self.current_step]
        
        # Technical indicators
        rsi = self._calculate_rsi()
        macd, macd_signal = self._calculate_macd()
        bb_upper, bb_lower = self._calculate_bollinger_bands()
        
        # Price features
        current_price = current_data['close']
        price_change = self._get_price_change()
        volume_ratio = self._get_volume_ratio()
        
        # Position features
        position_pnl = 0
        if self.position != 0 and self.entry_price > 0:
            position_pnl = (current_price - self.entry_price) * self.position * self.position_size
        
        state = np.array([
            current_price / 1000,  # Normalized price
            price_change,
            volume_ratio,
            rsi / 100,
            macd,
            macd_signal,
            bb_upper / 1000,
            bb_lower / 1000,
            self.position,
            position_pnl / self.initial_balance,
            self.balance / self.initial_balance,
            self.total_profit / self.initial_balance,
            self._get_volatility(),
            self._get_momentum(),
            self._get_trend_strength()
        ])
        
        return state
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict]:
        """
        Execute action and return next state, reward, done, info
        Actions: 0=Hold, 1=Buy, 2=Sell
        """
        if self.current_step >= len(self.data) - 1:
            return self._get_state(), 0, True, {}
        
        current_price = self.data[self.current_step]['close']
        prev_balance = self.balance
        
        # Execute action
        if action == 1:  # Buy
            reward = self._execute_buy(current_price)
        elif action == 2:  # Sell
            reward = self._execute_sell(current_price)
        else:  # Hold
            reward = self._calculate_hold_reward()
        
        # Move to next step
        self.current_step += 1
        
        # Calculate additional rewards
        reward += self._calculate_portfolio_reward()
        reward += self._calculate_risk_reward()
        
        # Update metrics
        self._update_metrics()
        
        # Check if done
        done = (self.current_step >= len(self.data) - 1) or (self.balance <= 0)
        
        info = {
            'balance': self.balance,
            'position': self.position,
            'total_profit': self.total_profit,
            'trade_count': self.trade_count,
            'win_rate': self.winning_trades / max(1, self.trade_count)
        }
        
        return self._get_state(), reward, done, info
    
    def _execute_buy(self, price: float) -> float:
        """Execute buy order"""
        if self.position == 1:  # Already long
            return -0.01  # Small penalty for redundant action
        
        if self.position == -1:  # Close short position
            profit = (self.entry_price - price) * self.position_size
            self.balance += profit
            self.total_profit += profit
            self.trade_count += 1
            if profit > 0:
                self.winning_trades += 1
        
        # Open long position
        self.position = 1
        self.position_size = self.balance * 0.95 / price  # Use 95% of balance
        self.entry_price = price
        
        return 0.01  # Small reward for taking action
    
    def _execute_sell(self, price: float) -> float:
        """Execute sell order"""
        if self.position == -1:  # Already short
            return -0.01  # Small penalty for redundant action
        
        if self.position == 1:  # Close long position
            profit = (price - self.entry_price) * self.position_size
            self.balance += profit
            self.total_profit += profit
            self.trade_count += 1
            if profit > 0:
                self.winning_trades += 1
        
        # Open short position (if allowed)
        self.position = -1
        self.position_size = self.balance * 0.95 / price
        self.entry_price = price
        
        return 0.01  # Small reward for taking action
    
    def _calculate_hold_reward(self) -> float:
        """Calculate reward for holding position"""
        if self.position == 0:
            return 0
        
        current_price = self.data[self.current_step]['close']
        unrealized_pnl = (current_price - self.entry_price) * self.position * self.position_size
        
        # Reward profitable holds, penalize losses
        return unrealized_pnl / self.initial_balance * 0.1
    
    def _calculate_portfolio_reward(self) -> float:
        """Calculate portfolio-based reward"""
        current_balance = self.balance
        if self.position != 0:
            current_price = self.data[self.current_step]['close']
            unrealized_pnl = (current_price - self.entry_price) * self.position * self.position_size
            current_balance += unrealized_pnl
        
        # Reward portfolio growth
        portfolio_return = (current_balance - self.initial_balance) / self.initial_balance
        return portfolio_return * 0.1
    
    def _calculate_risk_reward(self) -> float:
        """Calculate risk-adjusted reward"""
        # Penalize high drawdown
        current_balance = self.balance
        if self.position != 0:
            current_price = self.data[self.current_step]['close']
            unrealized_pnl = (current_price - self.entry_price) * self.position * self.position_size
            current_balance += unrealized_pnl
        
        if current_balance > self.peak_balance:
            self.peak_balance = current_balance
        
        drawdown = (self.peak_balance - current_balance) / self.peak_balance
        if drawdown > self.max_drawdown:
            self.max_drawdown = drawdown
        
        # Penalize high drawdown
        return -drawdown * 0.1
    
    def _update_metrics(self):
        """Update performance metrics"""
        current_balance = self.balance
        if self.position != 0:
            current_price = self.data[self.current_step]['close']
            unrealized_pnl = (current_price - self.entry_price) * self.position * self.position_size
            current_balance += unrealized_pnl
        
        if current_balance > self.peak_balance:
            self.peak_balance = current_balance
    
    # Technical indicator calculations
    def _calculate_rsi(self, period: int = 14) -> float:
        """Calculate RSI"""
        if self.current_step < period:
            return 50.0
        
        prices = [self.data[i]['close'] for i in range(self.current_step - period, self.current_step)]
        deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        
        gains = [d for d in deltas if d > 0]
        losses = [-d for d in deltas if d < 0]
        
        avg_gain = sum(gains) / len(gains) if gains else 0
        avg_loss = sum(losses) / len(losses) if losses else 0
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _calculate_macd(self) -> Tuple[float, float]:
        """Calculate MACD"""
        if self.current_step < 26:
            return 0.0, 0.0
        
        prices = [self.data[i]['close'] for i in range(max(0, self.current_step - 26), self.current_step)]
        
        ema_12 = self._calculate_ema(prices[-12:], 12) if len(prices) >= 12 else prices[-1]
        ema_26 = self._calculate_ema(prices, 26)
        macd = ema_12 - ema_26
        
        # Simple signal line (EMA of MACD)
        macd_signal = macd * 0.8  # Simplified
        
        return macd, macd_signal
    
    def _calculate_ema(self, prices: List[float], period: int) -> float:
        """Calculate Exponential Moving Average"""
        if not prices:
            return 0.0
        
        multiplier = 2 / (period + 1)
        ema = prices[0]
        
        for price in prices[1:]:
            ema = (price * multiplier) + (ema * (1 - multiplier))
        
        return ema
    
    def _calculate_bollinger_bands(self, period: int = 20) -> Tuple[float, float]:
        """Calculate Bollinger Bands"""
        if self.current_step < period:
            current_price = self.data[self.current_step]['close']
            return current_price * 1.02, current_price * 0.98
        
        prices = [self.data[i]['close'] for i in range(self.current_step - period, self.current_step)]
        mean = sum(prices) / len(prices)
        std = (sum((p - mean) ** 2 for p in prices) / len(prices)) ** 0.5
        
        upper = mean + (2 * std)
        lower = mean - (2 * std)
        
        return upper, lower
    
    def _get_price_change(self) -> float:
        """Get price change percentage"""
        if self.current_step == 0:
            return 0.0
        
        current_price = self.data[self.current_step]['close']
        prev_price = self.data[self.current_step - 1]['close']
        
        return (current_price - prev_price) / prev_price
    
    def _get_volume_ratio(self) -> float:
        """Get volume ratio compared to average"""
        if self.current_step < 10:
            return 1.0
        
        current_volume = self.data[self.current_step]['volume']
        avg_volume = sum(self.data[i]['volume'] for i in range(self.current_step - 10, self.current_step)) / 10
        
        return current_volume / max(avg_volume, 1)
    
    def _get_volatility(self) -> float:
        """Get recent volatility"""
        if self.current_step < 10:
            return 0.0
        
        prices = [self.data[i]['close'] for i in range(self.current_step - 10, self.current_step)]
        mean = sum(prices) / len(prices)
        variance = sum((p - mean) ** 2 for p in prices) / len(prices)
        
        return (variance ** 0.5) / mean
    
    def _get_momentum(self) -> float:
        """Get price momentum"""
        if self.current_step < 5:
            return 0.0
        
        current_price = self.data[self.current_step]['close']
        past_price = self.data[self.current_step - 5]['close']
        
        return (current_price - past_price) / past_price
    
    def _get_trend_strength(self) -> float:
        """Get trend strength"""
        if self.current_step < 20:
            return 0.0
        
        prices = [self.data[i]['close'] for i in range(self.current_step - 20, self.current_step)]
        
        # Calculate linear regression slope
        x = list(range(len(prices)))
        n = len(prices)
        
        sum_x = sum(x)
        sum_y = sum(prices)
        sum_xy = sum(x[i] * prices[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        
        return slope / prices[-1]  # Normalize by current price

class DQNAgent:
    """Deep Q-Network agent for trading"""
    
    def __init__(self, state_size: int = 15, action_size: int = 3):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=RL_MEMORY_SIZE)
        self.epsilon = 1.0  # Exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = RL_LEARNING_RATE
        self.batch_size = RL_BATCH_SIZE
        self.model_path = "models/dqn_model.h5"
        
        # Build neural networks
        self.q_network = self._build_model()
        self.target_network = self._build_model()
        self.update_target_network()
        
        # Create models directory
        os.makedirs("models", exist_ok=True)
    
    def _build_model(self) -> Sequential:
        """Build the DQN model"""
        model = Sequential([
            Dense(128, input_dim=self.state_size, activation='relu'),
            Dense(64, activation='relu'),
            Dense(32, activation='relu'),
            Dense(self.action_size, activation='linear')
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=self.learning_rate),
            loss='mse'
        )
        
        return model
    
    def remember(self, state, action, reward, next_state, done):
        """Store experience in replay memory"""
        self.memory.append((state, action, reward, next_state, done))
    
    def act(self, state, training: bool = True) -> int:
        """Choose action using epsilon-greedy policy"""
        if training and np.random.random() <= self.epsilon:
            return random.randrange(self.action_size)
        
        q_values = self.q_network.predict(state.reshape(1, -1), verbose=0)
        return np.argmax(q_values[0])
    
    def replay(self) -> float:
        """Train the model on a batch of experiences"""
        if len(self.memory) < self.batch_size:
            return 0.0
        
        batch = random.sample(self.memory, self.batch_size)
        states = np.array([e[0] for e in batch])
        actions = np.array([e[1] for e in batch])
        rewards = np.array([e[2] for e in batch])
        next_states = np.array([e[3] for e in batch])
        dones = np.array([e[4] for e in batch])
        
        # Current Q values
        current_q_values = self.q_network.predict(states, verbose=0)
        
        # Next Q values from target network
        next_q_values = self.target_network.predict(next_states, verbose=0)
        
        # Update Q values
        for i in range(self.batch_size):
            if dones[i]:
                current_q_values[i][actions[i]] = rewards[i]
            else:
                current_q_values[i][actions[i]] = rewards[i] + 0.95 * np.max(next_q_values[i])
        
        # Train the model
        history = self.q_network.fit(states, current_q_values, verbose=0)
        
        # Decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
        
        return history.history['loss'][0]
    
    def update_target_network(self):
        """Copy weights from main network to target network"""
        self.target_network.set_weights(self.q_network.get_weights())
    
    def save_model(self):
        """Save the trained model"""
        self.q_network.save(self.model_path)
        
        # Save additional parameters
        params = {
            'epsilon': self.epsilon,
            'state_size': self.state_size,
            'action_size': self.action_size
        }
        
        with open("models/dqn_params.pkl", "wb") as f:
            pickle.dump(params, f)
    
    def load_model(self) -> bool:
        """Load a pre-trained model"""
        try:
            if os.path.exists(self.model_path):
                self.q_network = load_model(self.model_path)
                self.target_network = load_model(self.model_path)
                
                # Load parameters
                if os.path.exists("models/dqn_params.pkl"):
                    with open("models/dqn_params.pkl", "rb") as f:
                        params = pickle.load(f)
                    self.epsilon = params.get('epsilon', self.epsilon_min)
                
                logger.info("DQN model loaded successfully")
                return True
            else:
                logger.warning("No pre-trained DQN model found")
                return False
        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            return False

class RLTradingAgent:
    """Main RL trading agent"""
    
    def __init__(self, symbol: str):
        self.symbol = symbol
        self.agent = DQNAgent()
        self.environment = None
        self.is_trained = False
        
        # Try to load pre-trained model
        if self.agent.load_model():
            self.is_trained = True
    
    def train(self, training_data: List[Dict], episodes: int = 1000) -> Dict:
        """Train the RL agent"""
        try:
            logger.info(f"Starting RL training for {self.symbol}")
            
            self.environment = TradingEnvironment(training_data)
            
            scores = []
            losses = []
            
            for episode in range(episodes):
                state = self.environment.reset()
                total_reward = 0
                steps = 0
                
                while steps < len(training_data) - 1:
                    action = self.agent.act(state)
                    next_state, reward, done, info = self.environment.step(action)
                    
                    self.agent.remember(state, action, reward, next_state, done)
                    state = next_state
                    total_reward += reward
                    steps += 1
                    
                    if done:
                        break
                
                # Train the agent
                if len(self.agent.memory) > self.agent.batch_size:
                    loss = self.agent.replay()
                    losses.append(loss)
                
                scores.append(total_reward)
                
                # Update target network every 100 episodes
                if episode % 100 == 0:
                    self.agent.update_target_network()
                
                # Log progress
                if episode % 100 == 0:
                    avg_score = np.mean(scores[-100:])
                    logger.info(f"Episode {episode}, Average Score: {avg_score:.2f}, Epsilon: {self.agent.epsilon:.2f}")
            
            # Save the trained model
            self.agent.save_model()
            self.is_trained = True
            
            # Calculate final metrics
            final_balance = self.environment.balance
            total_return = (final_balance - self.environment.initial_balance) / self.environment.initial_balance
            win_rate = self.environment.winning_trades / max(1, self.environment.trade_count)
            
            training_results = {
                "success": True,
                "symbol": self.symbol,
                "episodes": episodes,
                "final_return": total_return,
                "win_rate": win_rate,
                "total_trades": self.environment.trade_count,
                "max_drawdown": self.environment.max_drawdown,
                "avg_score": np.mean(scores[-100:]) if scores else 0,
                "training_date": datetime.now().isoformat()
            }
            
            logger.info(f"RL training completed for {self.symbol}: Return={total_return:.2%}, Win Rate={win_rate:.2%}")
            return training_results
            
        except Exception as e:
            logger.error(f"RL training failed for {self.symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    def get_action(self, current_data: List[Dict]) -> Dict:
        """Get trading action recommendation"""
        try:
            if not self.is_trained:
                return {"success": False, "error": "Agent not trained"}
            
            # Create temporary environment for current state
            temp_env = TradingEnvironment(current_data)
            temp_env.current_step = len(current_data) - 1
            
            state = temp_env._get_state()
            action = self.agent.act(state, training=False)
            
            # Get Q-values for confidence
            q_values = self.agent.q_network.predict(state.reshape(1, -1), verbose=0)[0]
            confidence = (np.max(q_values) - np.min(q_values)) / (np.max(q_values) + 1e-8)
            
            action_map = {0: "HOLD", 1: "BUY", 2: "SELL"}
            
            return {
                "success": True,
                "symbol": self.symbol,
                "action": action_map[action],
                "confidence": float(confidence),
                "q_values": q_values.tolist(),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Action prediction failed for {self.symbol}: {e}")
            return {"success": False, "error": str(e)}

class RLModelManager:
    """Manages multiple RL agents for different symbols"""
    
    def __init__(self):
        self.agents: Dict[str, RLTradingAgent] = {}
    
    def get_or_create_agent(self, symbol: str) -> RLTradingAgent:
        """Get existing agent or create new one"""
        if symbol not in self.agents:
            self.agents[symbol] = RLTradingAgent(symbol)
        
        return self.agents[symbol]
    
    def train_agent(self, symbol: str, training_data: List[Dict], episodes: int = 1000) -> Dict:
        """Train agent for a specific symbol"""
        agent = self.get_or_create_agent(symbol)
        return agent.train(training_data, episodes)
    
    def get_trading_signal(self, symbol: str, current_data: List[Dict]) -> Dict:
        """Get trading signal from RL agent"""
        agent = self.get_or_create_agent(symbol)
        return agent.get_action(current_data)

# Global instance
rl_manager = RLModelManager()
