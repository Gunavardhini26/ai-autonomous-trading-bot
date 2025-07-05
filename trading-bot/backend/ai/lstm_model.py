import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import os

from config import LSTM_SEQUENCE_LENGTH
from data.historical_fetch import alpha_vantage_client

logger = logging.getLogger(__name__)

class LSTMPricePredictor:
    def __init__(self, symbol: str, sequence_length: int = LSTM_SEQUENCE_LENGTH):
        self.symbol = symbol
        self.sequence_length = sequence_length
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.is_trained = False
        self.model_path = f"models/lstm_{symbol}.h5"
        self.scaler_path = f"models/scaler_{symbol}.pkl"
        
        # Create models directory
        os.makedirs("models", exist_ok=True)
    
    async def prepare_data(self, data: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data for LSTM training
        Features: [open, high, low, close, volume, price_change, volatility]
        """
        try:
            # Convert to DataFrame
            df = pd.DataFrame(data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Calculate additional features
            df['price_change'] = df['close'].pct_change()
            df['volatility'] = df['close'].rolling(window=20).std()
            df['ema_12'] = df['close'].ewm(span=12).mean()
            df['ema_26'] = df['close'].ewm(span=26).mean()
            df['rsi'] = self._calculate_rsi(df['close'])
            
            # Select features
            features = ['open', 'high', 'low', 'close', 'volume', 
                       'price_change', 'volatility', 'ema_12', 'ema_26', 'rsi']
            
            # Remove NaN values
            df = df[features].dropna()
            
            if len(df) < self.sequence_length + 1:
                raise ValueError(f"Insufficient data: {len(df)} rows, need at least {self.sequence_length + 1}")
            
            # Scale features
            scaled_data = self.scaler.fit_transform(df.values)
            
            # Create sequences
            X, y = [], []
            for i in range(self.sequence_length, len(scaled_data)):
                X.append(scaled_data[i-self.sequence_length:i])
                y.append(scaled_data[i, 3])  # Predict close price (index 3)
            
            return np.array(X), np.array(y)
            
        except Exception as e:
            logger.error(f"Data preparation failed for {self.symbol}: {e}")
            raise
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def build_model(self, input_shape: Tuple[int, int]) -> Sequential:
        """Build LSTM model architecture"""
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            
            LSTM(units=50, return_sequences=True),
            Dropout(0.2),
            
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            
            Dense(units=25),
            Dense(units=1)
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mean_squared_error',
            metrics=['mae']
        )
        
        return model
    
    async def train(self, historical_data: List[Dict], epochs: int = 50, batch_size: int = 32) -> Dict:
        """Train the LSTM model"""
        try:
            logger.info(f"Starting LSTM training for {self.symbol}")
            
            # Prepare data
            X, y = await self.prepare_data(historical_data)
            
            # Split data (80% train, 20% validation)
            train_size = int(0.8 * len(X))
            X_train, X_val = X[:train_size], X[train_size:]
            y_train, y_val = y[:train_size], y[train_size:]
            
            # Build model
            self.model = self.build_model((X.shape[1], X.shape[2]))
            
            # Train model
            history = self.model.fit(
                X_train, y_train,
                epochs=epochs,
                batch_size=batch_size,
                validation_data=(X_val, y_val),
                verbose=0,
                shuffle=False
            )
            
            # Calculate metrics
            train_pred = self.model.predict(X_train)
            val_pred = self.model.predict(X_val)
            
            train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
            val_rmse = np.sqrt(mean_squared_error(y_val, val_pred))
            
            train_mae = mean_absolute_error(y_train, train_pred)
            val_mae = mean_absolute_error(y_val, val_pred)
            
            # Save model and scaler
            self.model.save(self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            self.is_trained = True
            
            training_results = {
                "success": True,
                "symbol": self.symbol,
                "train_rmse": float(train_rmse),
                "val_rmse": float(val_rmse),
                "train_mae": float(train_mae),
                "val_mae": float(val_mae),
                "final_loss": float(history.history['loss'][-1]),
                "epochs": epochs,
                "data_points": len(X),
                "training_date": datetime.now().isoformat()
            }
            
            logger.info(f"LSTM training completed for {self.symbol}: Val RMSE={val_rmse:.4f}")
            return training_results
            
        except Exception as e:
            logger.error(f"LSTM training failed for {self.symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    def load_model(self) -> bool:
        """Load pre-trained model and scaler"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = load_model(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info(f"Loaded pre-trained LSTM model for {self.symbol}")
                return True
            else:
                logger.warning(f"No pre-trained model found for {self.symbol}")
                return False
        except Exception as e:
            logger.error(f"Model loading failed for {self.symbol}: {e}")
            return False
    
    async def predict(self, recent_data: List[Dict], steps_ahead: int = 1) -> Dict:
        """
        Make price predictions
        steps_ahead: Number of time periods to predict (1 = next period)
        """
        try:
            if not self.is_trained:
                return {"success": False, "error": "Model not trained"}
            
            # Prepare recent data
            df = pd.DataFrame(recent_data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp').tail(self.sequence_length)
            
            if len(df) < self.sequence_length:
                return {"success": False, "error": f"Need at least {self.sequence_length} data points"}
            
            # Calculate features (same as training)
            df['price_change'] = df['close'].pct_change()
            df['volatility'] = df['close'].rolling(window=min(20, len(df))).std()
            df['ema_12'] = df['close'].ewm(span=12).mean()
            df['ema_26'] = df['close'].ewm(span=26).mean()
            df['rsi'] = self._calculate_rsi(df['close'])
            
            features = ['open', 'high', 'low', 'close', 'volume', 
                       'price_change', 'volatility', 'ema_12', 'ema_26', 'rsi']
            
            # Fill NaN values
            df[features] = df[features].fillna(method='bfill').fillna(method='ffill')
            
            # Scale data
            scaled_data = self.scaler.transform(df[features].values)
            
            # Prepare input sequence
            X = np.array([scaled_data])
            
            # Make predictions
            predictions = []
            current_sequence = X[0]
            
            for _ in range(steps_ahead):
                pred = self.model.predict(np.array([current_sequence]), verbose=0)[0, 0]
                predictions.append(pred)
                
                # Update sequence for next prediction
                if steps_ahead > 1:
                    # Create new row with prediction
                    new_row = np.copy(current_sequence[-1])
                    new_row[3] = pred  # Update close price
                    current_sequence = np.vstack([current_sequence[1:], new_row])
            
            # Inverse transform predictions (only close price)
            dummy_array = np.zeros((len(predictions), len(features)))
            dummy_array[:, 3] = predictions
            predictions_inverse = self.scaler.inverse_transform(dummy_array)[:, 3]
            
            # Calculate confidence based on recent model accuracy
            confidence = self._calculate_confidence(recent_data[-10:])
            
            return {
                "success": True,
                "symbol": self.symbol,
                "predictions": predictions_inverse.tolist(),
                "confidence": confidence,
                "steps_ahead": steps_ahead,
                "current_price": df['close'].iloc[-1],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Prediction failed for {self.symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    def _calculate_confidence(self, recent_data: List[Dict]) -> float:
        """Calculate prediction confidence based on recent accuracy"""
        try:
            if len(recent_data) < 5:
                return 0.5  # Default confidence
            
            # Compare recent predictions with actual prices
            # This is a simplified confidence calculation
            df = pd.DataFrame(recent_data)
            volatility = df['close'].std() / df['close'].mean()
            
            # Lower volatility = higher confidence
            confidence = max(0.1, min(0.9, 1.0 - volatility * 5))
            return confidence
            
        except:
            return 0.5

    async def update_with_new_data(self, new_data: List[Dict]) -> bool:
        """Update model with new data (incremental learning)"""
        try:
            if not self.is_trained:
                return False
            
            # For simplicity, we'll retrain the model periodically
            # In production, you might implement true incremental learning
            if len(new_data) >= 100:  # Retrain with sufficient new data
                training_result = await self.train(new_data, epochs=10, batch_size=16)
                return training_result.get("success", False)
            
            return True
            
        except Exception as e:
            logger.error(f"Model update failed for {self.symbol}: {e}")
            return False

class LSTMModelManager:
    """Manages multiple LSTM models for different symbols"""
    
    def __init__(self):
        self.models: Dict[str, LSTMPricePredictor] = {}
    
    def get_or_create_model(self, symbol: str) -> LSTMPricePredictor:
        """Get existing model or create new one"""
        if symbol not in self.models:
            self.models[symbol] = LSTMPricePredictor(symbol)
            # Try to load pre-trained model
            self.models[symbol].load_model()
        
        return self.models[symbol]
    
    async def train_model(self, symbol: str, epochs: int = 50) -> Dict:
        """Train model for a specific symbol"""
        try:
            model = self.get_or_create_model(symbol)
            
            # Fetch historical data
            data_result = await alpha_vantage_client.get_daily_data(symbol, outputsize="full")
            
            if not data_result.get("success"):
                return {"success": False, "error": "Failed to fetch historical data"}
            
            historical_data = data_result["data"]
            
            # Convert to expected format
            formatted_data = []
            for item in historical_data:
                formatted_data.append({
                    "timestamp": item["date"],
                    "open": item["open"],
                    "high": item["high"],
                    "low": item["low"],
                    "close": item["close"],
                    "volume": item["volume"]
                })
            
            # Train model
            return await model.train(formatted_data, epochs=epochs)
            
        except Exception as e:
            logger.error(f"Model training failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_predictions(self, symbol: str, steps_ahead: int = 1) -> Dict:
        """Get predictions for a symbol"""
        try:
            model = self.get_or_create_model(symbol)
            
            if not model.is_trained:
                return {"success": False, "error": "Model not trained"}
            
            # Get recent data for prediction
            data_result = await alpha_vantage_client.get_intraday_data(symbol, interval="5min")
            
            if not data_result.get("success"):
                return {"success": False, "error": "Failed to fetch recent data"}
            
            recent_data = data_result["data"][:60]  # Last 60 periods
            
            # Convert to expected format
            formatted_data = []
            for item in recent_data:
                formatted_data.append({
                    "timestamp": item["timestamp"],
                    "open": item["open"],
                    "high": item["high"],
                    "low": item["low"],
                    "close": item["close"],
                    "volume": item["volume"]
                })
            
            return await model.predict(formatted_data, steps_ahead)
            
        except Exception as e:
            logger.error(f"Prediction failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}

# Global instance
lstm_manager = LSTMModelManager()
