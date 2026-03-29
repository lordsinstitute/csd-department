"""
ML model training and inference
Extracted from notebooks for reuse
"""
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import Optional, List
import pickle
import os


class CryptoPredictor:
    """Simple linear regression predictor for normalized crypto prices"""
    
    def __init__(self, model_version: str = "v1"):
        self.model = LinearRegression()
        self.model_version = model_version
        self.is_trained = False
    
    def train(self, X: np.ndarray, y: np.ndarray):
        """
        Train the model
        
        Args:
            X: Feature array (step indices)
            y: Target array (normalized prices)
        """
        if len(X) < 10:
            raise ValueError("Need at least 10 data points for training")
        
        self.model.fit(X, y)
        self.is_trained = True
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict normalized prices
        
        Args:
            X: Feature array
            
        Returns:
            Predicted normalized prices
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        predictions = self.model.predict(X)
        # Clamp to [0, 1]
        return np.clip(predictions, 0.0, 1.0)
    
    def predict_next(self, current_length: int) -> float:
        """
        Predict next normalized price (convenience method)
        
        Args:
            current_length: Current number of data points
            
        Returns:
            Predicted next normalized price
        """
        next_step = np.array([[current_length]])
        return float(self.predict(next_step)[0])
    
    def save(self, filepath: str):
        """Save model to file"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump({
                "model": self.model,
                "version": self.model_version,
                "is_trained": self.is_trained
            }, f)
    
    @classmethod
    def load(cls, filepath: str) -> "CryptoPredictor":
        """Load model from file"""
        with open(filepath, "rb") as f:
            data = pickle.load(f)
        
        predictor = cls(model_version=data["version"])
        predictor.model = data["model"]
        predictor.is_trained = data["is_trained"]
        return predictor


def train_model_for_coin(coin: str, prices: List[float], model_dir: str = "models") -> CryptoPredictor:
    """
    Train a model for a specific coin
    
    Args:
        coin: Coin symbol
        prices: List of normalized prices
        model_dir: Directory to save model
        
    Returns:
        Trained CryptoPredictor instance
    """
    from ml.features import prepare_features_for_ml
    
    X, y = prepare_features_for_ml(prices)
    
    predictor = CryptoPredictor(model_version=f"{coin}_v1")
    predictor.train(X, y)
    
    # Save model
    os.makedirs(model_dir, exist_ok=True)
    predictor.save(os.path.join(model_dir, f"{coin}_model.pkl"))
    
    return predictor


def predict_next_price(coin: str, prices: List[float], model_dir: str = "models") -> Optional[float]:
    """
    Quick prediction function (trains on-the-fly)
    
    Args:
        coin: Coin symbol
        prices: List of normalized prices
        model_dir: Directory for model storage
        
    Returns:
        Predicted next normalized price or None if insufficient data
    """
    if len(prices) < 10:
        return None
    
    try:
        predictor = train_model_for_coin(coin, prices, model_dir)
        return predictor.predict_next(len(prices))
    except Exception as e:
        print(f"Prediction error for {coin}: {e}")
        return None
