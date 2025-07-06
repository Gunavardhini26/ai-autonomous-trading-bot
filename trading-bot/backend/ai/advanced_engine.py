"""
Advanced AI Engine for Autonomous Trading
Implements multiple ML models, deep learning, and reinforcement learning
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import tensorflow as tf
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
import xgboost as xgb
import lightgbm as lgb
from transformers import pipeline, AutoTokenizer, AutoModel
import stable_baselines3 as sb3
from stable_baselines3 import PPO, A2C, DQN
import gymnasium as gym
from typing import Dict, List, Tuple, Optional, Any
import asyncio
import joblib
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

@dataclass
class TradingSignal:
    """Enhanced trading signal with confidence and reasoning"""
    action: str  # 'BUY', 'SELL', 'HOLD'
    confidence: float  # 0-1
    price_target: Optional[float]
    stop_loss: Optional[float]
    position_size: float
    reasoning: str
    model_predictions: Dict[str, float]
    risk_score: float
    timestamp: datetime

class AdvancedNeuralNetwork(nn.Module):
    """Advanced neural network for price prediction"""
    
    def __init__(self, input_size: int, hidden_sizes: List[int], output_size: int):
        super().__init__()
        
        layers = []
        prev_size = input_size
        
        for hidden_size in hidden_sizes:
            layers.extend([
                nn.Linear(prev_size, hidden_size),
                nn.BatchNorm1d(hidden_size),
                nn.ReLU(),
                nn.Dropout(0.2)
            ])
            prev_size = hidden_size
        
        layers.append(nn.Linear(prev_size, output_size))
        self.network = nn.Sequential(*layers)
        
    def forward(self, x):
        return self.network(x)

class TransformerPricePredictor(nn.Module):
    """Transformer-based price prediction model"""
    
    def __init__(self, input_dim: int, seq_length: int, num_heads: int = 8, num_layers: int = 6):
        super().__init__()
        self.input_dim = input_dim
        self.seq_length = seq_length
        
        self.embedding = nn.Linear(input_dim, 512)
        self.pos_encoding = nn.Parameter(torch.randn(seq_length, 512))
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=512, 
            nhead=num_heads, 
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        self.output_layer = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 3)  # price_change, volatility, direction
        )
        
    def forward(self, x):
        # x shape: (batch_size, seq_length, input_dim)
        x = self.embedding(x) + self.pos_encoding
        x = self.transformer(x)
        x = x.mean(dim=1)  # Global average pooling
        return self.output_layer(x)

class SentimentAnalyzer:
    """Advanced sentiment analysis for market news and social media"""
    
    def __init__(self):
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment"
        )
        self.finbert = pipeline(
            "sentiment-analysis",
            model="ProsusAI/finbert"
        )
        
    async def analyze_news_sentiment(self, news_texts: List[str]) -> Dict[str, float]:
        """Analyze sentiment from news articles"""
        try:
            sentiments = self.finbert(news_texts)
            
            sentiment_scores = {
                'positive': 0.0,
                'negative': 0.0,
                'neutral': 0.0
            }
            
            for sentiment in sentiments:
                label = sentiment['label'].lower()
                score = sentiment['score']
                sentiment_scores[label] += score
                
            total = sum(sentiment_scores.values())
            if total > 0:
                sentiment_scores = {k: v/total for k, v in sentiment_scores.items()}
                
            return sentiment_scores
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}

class TradingEnvironment(gym.Env):
    """Custom trading environment for reinforcement learning"""
    
    def __init__(self, data: pd.DataFrame, initial_balance: float = 10000):
        super().__init__()
        
        self.data = data
        self.initial_balance = initial_balance
        self.current_step = 0
        self.balance = initial_balance
        self.position = 0
        self.entry_price = 0
        
        # Action space: 0=HOLD, 1=BUY, 2=SELL
        self.action_space = gym.spaces.Discrete(3)
        
        # Observation space: price features + portfolio state
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf, 
            shape=(data.shape[1] + 3,), dtype=np.float32
        )
        
    def reset(self, seed=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.balance = self.initial_balance
        self.position = 0
        self.entry_price = 0
        return self._get_observation(), {}
        
    def step(self, action):
        current_price = self.data.iloc[self.current_step]['close']
        
        # Execute action
        reward = 0
        if action == 1 and self.position == 0:  # BUY
            self.position = self.balance / current_price
            self.balance = 0
            self.entry_price = current_price
            
        elif action == 2 and self.position > 0:  # SELL
            self.balance = self.position * current_price
            profit = self.balance - self.initial_balance
            reward = profit / self.initial_balance  # Percentage return
            self.position = 0
            
        self.current_step += 1
        
        # Check if episode is done
        done = self.current_step >= len(self.data) - 1
        
        # Calculate portfolio value
        portfolio_value = self.balance + (self.position * current_price)
        
        return self._get_observation(), reward, done, False, {}
        
    def _get_observation(self):
        if self.current_step >= len(self.data):
            self.current_step = len(self.data) - 1
            
        market_features = self.data.iloc[self.current_step].values
        portfolio_state = np.array([
            self.balance / self.initial_balance,
            self.position,
            self.entry_price if self.entry_price > 0 else 0
        ])
        
        return np.concatenate([market_features, portfolio_state]).astype(np.float32)

class AdvancedAIEngine:
    """Main AI engine orchestrating all models and strategies"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.sentiment_analyzer = SentimentAnalyzer()
        self.rl_agent = None
        self.transformer_model = None
        self.is_trained = False
        
    async def initialize_models(self):
        """Initialize all AI models"""
        logger.info("Initializing advanced AI models...")
        
        # Initialize traditional ML models
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=200, max_depth=10, random_state=42
        )
        self.models['xgboost'] = xgb.XGBClassifier(
            n_estimators=200, max_depth=8, learning_rate=0.1
        )
        self.models['lightgbm'] = lgb.LGBMClassifier(
            n_estimators=200, max_depth=8
        )
        
        # Initialize scalers
        self.scalers['standard'] = StandardScaler()
        self.scalers['minmax'] = MinMaxScaler()
        
        logger.info("AI models initialized successfully")
        
    async def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Advanced feature engineering"""
        features = data.copy()
        
        # Technical indicators
        features['rsi'] = self._calculate_rsi(features['close'])
        features['macd'], features['macd_signal'] = self._calculate_macd(features['close'])
        features['bb_upper'], features['bb_lower'] = self._calculate_bollinger_bands(features['close'])
        
        # Price-based features
        features['price_change'] = features['close'].pct_change()
        features['high_low_ratio'] = features['high'] / features['low']
        features['volume_price_trend'] = features['volume'] * features['price_change']
        
        # Advanced features
        features['volatility'] = features['price_change'].rolling(20).std()
        features['momentum'] = features['close'] / features['close'].shift(10) - 1
        features['mean_reversion'] = (features['close'] - features['close'].rolling(20).mean()) / features['close'].rolling(20).std()
        
        # Time-based features
        if 'timestamp' in features.columns:
            features['hour'] = pd.to_datetime(features['timestamp']).dt.hour
            features['day_of_week'] = pd.to_datetime(features['timestamp']).dt.dayofweek
            features['month'] = pd.to_datetime(features['timestamp']).dt.month
            
        return features.fillna(0)
        
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI indicator"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))
        
    def _calculate_macd(self, prices: pd.Series) -> Tuple[pd.Series, pd.Series]:
        """Calculate MACD indicator"""
        exp1 = prices.ewm(span=12).mean()
        exp2 = prices.ewm(span=26).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9).mean()
        return macd, signal
        
    def _calculate_bollinger_bands(self, prices: pd.Series, period: int = 20) -> Tuple[pd.Series, pd.Series]:
        """Calculate Bollinger Bands"""
        rolling_mean = prices.rolling(window=period).mean()
        rolling_std = prices.rolling(window=period).std()
        upper_band = rolling_mean + (rolling_std * 2)
        lower_band = rolling_mean - (rolling_std * 2)
        return upper_band, lower_band
        
    async def train_models(self, data: pd.DataFrame):
        """Train all AI models with market data"""
        logger.info("Training AI models...")
        
        # Prepare features and targets
        features = await self.prepare_features(data)
        
        # Create target variable (next period price direction)
        features['target'] = (features['close'].shift(-1) > features['close']).astype(int)
        
        # Remove rows with NaN values
        features = features.dropna()
        
        # Split features and target
        X = features.drop(['target'], axis=1)
        y = features['target']
        
        # Scale features
        X_scaled = self.scalers['standard'].fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Train traditional ML models
        for name, model in self.models.items():
            if name in ['random_forest', 'xgboost', 'lightgbm']:
                logger.info(f"Training {name}...")
                model.fit(X_train, y_train)
                score = model.score(X_test, y_test)
                logger.info(f"{name} accuracy: {score:.4f}")
                
        # Train neural network
        await self._train_neural_network(X_train, y_train, X_test, y_test)
        
        # Train transformer model
        await self._train_transformer_model(features)
        
        # Train RL agent
        await self._train_rl_agent(features)
        
        self.is_trained = True
        logger.info("All models trained successfully")
        
    async def _train_neural_network(self, X_train, y_train, X_test, y_test):
        """Train the neural network model"""
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        model = AdvancedNeuralNetwork(
            input_size=X_train.shape[1],
            hidden_sizes=[256, 128, 64],
            output_size=2
        ).to(device)
        
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        
        # Convert to tensors
        X_train_tensor = torch.FloatTensor(X_train).to(device)
        y_train_tensor = torch.LongTensor(y_train.values).to(device)
        
        model.train()
        for epoch in range(100):
            optimizer.zero_grad()
            outputs = model(X_train_tensor)
            loss = criterion(outputs, y_train_tensor)
            loss.backward()
            optimizer.step()
            
        self.models['neural_network'] = model
        logger.info("Neural network trained successfully")
        
    async def _train_transformer_model(self, data: pd.DataFrame):
        """Train the transformer model"""
        # Prepare sequence data
        sequence_length = 60
        
        sequences = []
        targets = []
        
        for i in range(sequence_length, len(data)):
            seq = data.iloc[i-sequence_length:i][['close', 'volume', 'high', 'low']].values
            target = [
                data.iloc[i]['close'] - data.iloc[i-1]['close'],  # price change
                data.iloc[i]['volatility'],  # volatility
                1 if data.iloc[i]['close'] > data.iloc[i-1]['close'] else 0  # direction
            ]
            sequences.append(seq)
            targets.append(target)
            
        if len(sequences) > 0:
            X = torch.FloatTensor(sequences)
            y = torch.FloatTensor(targets)
            
            self.transformer_model = TransformerPricePredictor(
                input_dim=4, seq_length=sequence_length
            )
            
            criterion = nn.MSELoss()
            optimizer = torch.optim.Adam(self.transformer_model.parameters(), lr=0.0001)
            
            for epoch in range(50):
                optimizer.zero_grad()
                outputs = self.transformer_model(X[:100])  # Use subset for training
                loss = criterion(outputs, y[:100])
                loss.backward()
                optimizer.step()
                
        logger.info("Transformer model trained successfully")
        
    async def _train_rl_agent(self, data: pd.DataFrame):
        """Train the reinforcement learning agent"""
        try:
            # Create trading environment
            env = TradingEnvironment(data)
            
            # Initialize PPO agent
            self.rl_agent = PPO(
                "MlpPolicy",
                env,
                learning_rate=0.0003,
                n_steps=2048,
                batch_size=64,
                n_epochs=10,
                verbose=0
            )
            
            # Train the agent
            self.rl_agent.learn(total_timesteps=10000)
            logger.info("RL agent trained successfully")
            
        except Exception as e:
            logger.error(f"RL training error: {e}")
            
    async def predict_market_direction(self, current_data: pd.DataFrame) -> Dict[str, float]:
        """Get predictions from all models"""
        if not self.is_trained:
            await self.initialize_models()
            
        predictions = {}
        
        try:
            # Prepare features
            features = await self.prepare_features(current_data)
            latest_features = features.iloc[-1:].drop(['timestamp'], axis=1, errors='ignore')
            
            # Scale features
            X_scaled = self.scalers['standard'].transform(latest_features)
            
            # Get predictions from traditional ML models
            for name, model in self.models.items():
                if name in ['random_forest', 'xgboost', 'lightgbm']:
                    pred = model.predict_proba(X_scaled)[0]
                    predictions[name] = pred[1] if len(pred) > 1 else pred[0]
                    
            # Neural network prediction
            if 'neural_network' in self.models:
                with torch.no_grad():
                    nn_input = torch.FloatTensor(X_scaled)
                    nn_output = torch.softmax(self.models['neural_network'](nn_input), dim=1)
                    predictions['neural_network'] = nn_output[0][1].item()
                    
            # Transformer prediction
            if self.transformer_model and len(current_data) >= 60:
                with torch.no_grad():
                    seq_data = current_data.iloc[-60:][['close', 'volume', 'high', 'low']].values
                    seq_tensor = torch.FloatTensor(seq_data).unsqueeze(0)
                    transformer_output = self.transformer_model(seq_tensor)
                    predictions['transformer'] = torch.sigmoid(transformer_output[0][2]).item()
                    
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            
        return predictions
        
    async def generate_trading_signal(
        self, 
        current_data: pd.DataFrame, 
        news_sentiment: Optional[Dict[str, float]] = None,
        risk_tolerance: float = 0.5
    ) -> TradingSignal:
        """Generate comprehensive trading signal"""
        
        # Get model predictions
        predictions = await self.predict_market_direction(current_data)
        
        # Calculate ensemble prediction
        if predictions:
            ensemble_score = np.mean(list(predictions.values()))
        else:
            ensemble_score = 0.5
            
        # Incorporate sentiment analysis
        sentiment_score = 0.5
        if news_sentiment:
            sentiment_score = news_sentiment.get('positive', 0.5)
            
        # Combine predictions with sentiment
        final_score = (ensemble_score * 0.7) + (sentiment_score * 0.3)
        
        # Determine action based on score and risk tolerance
        if final_score > (0.5 + risk_tolerance * 0.3):
            action = 'BUY'
            confidence = min(final_score, 0.95)
        elif final_score < (0.5 - risk_tolerance * 0.3):
            action = 'SELL'
            confidence = min(1 - final_score, 0.95)
        else:
            action = 'HOLD'
            confidence = 1 - abs(final_score - 0.5) * 2
            
        # Calculate position size based on confidence and risk
        position_size = min(confidence * (1 - risk_tolerance), 1.0)
        
        # Calculate risk score
        volatility = current_data['close'].pct_change().std() if len(current_data) > 1 else 0.02
        risk_score = min(volatility * 100, 1.0)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(predictions, sentiment_score, final_score, action)
        
        return TradingSignal(
            action=action,
            confidence=confidence,
            price_target=None,  # Will be calculated by risk management
            stop_loss=None,     # Will be calculated by risk management
            position_size=position_size,
            reasoning=reasoning,
            model_predictions=predictions,
            risk_score=risk_score,
            timestamp=datetime.now()
        )
        
    def _generate_reasoning(
        self, 
        predictions: Dict[str, float], 
        sentiment_score: float, 
        final_score: float, 
        action: str
    ) -> str:
        """Generate human-readable reasoning for the trading decision"""
        
        reasoning_parts = []
        
        # Model consensus
        if predictions:
            avg_prediction = np.mean(list(predictions.values()))
            if avg_prediction > 0.6:
                reasoning_parts.append("Strong bullish consensus from AI models")
            elif avg_prediction < 0.4:
                reasoning_parts.append("Strong bearish consensus from AI models")
            else:
                reasoning_parts.append("Mixed signals from AI models")
                
        # Sentiment analysis
        if sentiment_score > 0.6:
            reasoning_parts.append("Positive market sentiment")
        elif sentiment_score < 0.4:
            reasoning_parts.append("Negative market sentiment")
        else:
            reasoning_parts.append("Neutral market sentiment")
            
        # Final decision reasoning
        if action == 'BUY':
            reasoning_parts.append(f"Combined analysis suggests upward movement (confidence: {final_score:.2f})")
        elif action == 'SELL':
            reasoning_parts.append(f"Combined analysis suggests downward movement (confidence: {1-final_score:.2f})")
        else:
            reasoning_parts.append("Market conditions suggest holding current position")
            
        return ". ".join(reasoning_parts)
        
    async def save_models(self, path: str):
        """Save trained models to disk"""
        import pickle
        import os
        
        os.makedirs(path, exist_ok=True)
        
        # Save traditional ML models
        for name, model in self.models.items():
            if name in ['random_forest', 'xgboost', 'lightgbm']:
                joblib.dump(model, f"{path}/{name}.pkl")
                
        # Save scalers
        for name, scaler in self.scalers.items():
            joblib.dump(scaler, f"{path}/{name}_scaler.pkl")
            
        # Save neural network
        if 'neural_network' in self.models:
            torch.save(self.models['neural_network'].state_dict(), f"{path}/neural_network.pth")
            
        # Save transformer model
        if self.transformer_model:
            torch.save(self.transformer_model.state_dict(), f"{path}/transformer.pth")
            
        # Save RL agent
        if self.rl_agent:
            self.rl_agent.save(f"{path}/rl_agent")
            
        logger.info(f"Models saved to {path}")
        
    async def load_models(self, path: str):
        """Load trained models from disk"""
        import pickle
        import os
        
        if not os.path.exists(path):
            logger.warning(f"Models path {path} does not exist")
            return
            
        try:
            # Load traditional ML models
            for name in ['random_forest', 'xgboost', 'lightgbm']:
                model_path = f"{path}/{name}.pkl"
                if os.path.exists(model_path):
                    self.models[name] = joblib.load(model_path)
                    
            # Load scalers
            for name in ['standard', 'minmax']:
                scaler_path = f"{path}/{name}_scaler.pkl"
                if os.path.exists(scaler_path):
                    self.scalers[name] = joblib.load(scaler_path)
                    
            # Load neural network
            nn_path = f"{path}/neural_network.pth"
            if os.path.exists(nn_path):
                # Note: Need to know architecture to load properly
                pass
                
            # Load RL agent
            rl_path = f"{path}/rl_agent"
            if os.path.exists(rl_path + ".zip"):
                self.rl_agent = PPO.load(rl_path)
                
            self.is_trained = True
            logger.info(f"Models loaded from {path}")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")

# Global AI engine instance
ai_engine = AdvancedAIEngine()
