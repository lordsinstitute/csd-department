"""
Feature engineering for crypto price data
Extracted from notebooks for reuse
"""
import pandas as pd
import numpy as np
from typing import List, Tuple


def normalize_price(raw_price: float, historical_prices: List[float]) -> float:
    """
    Normalize price to [0, 1] range based on historical min/max
    
    Args:
        raw_price: Current raw price
        historical_prices: List of recent prices for normalization
        
    Returns:
        Normalized price in [0, 1]
    """
    if not historical_prices:
        return 0.5
    
    prices = historical_prices + [raw_price]
    min_price = min(prices)
    max_price = max(prices)
    
    if max_price == min_price:
        return 0.5
    
    normalized = (raw_price - min_price) / (max_price - min_price)
    return float(np.clip(normalized, 0.0, 1.0))


def compute_returns(prices: pd.Series, periods: List[int] = [1, 5, 15]) -> pd.DataFrame:
    """
    Compute returns for different time periods
    
    Args:
        prices: Series of prices
        periods: List of periods to compute returns for
        
    Returns:
        DataFrame with return columns
    """
    df = pd.DataFrame({"price": prices})
    
    for period in periods:
        df[f"return_{period}m"] = df["price"].pct_change(periods=period)
    
    return df


def compute_volatility(returns: pd.Series, windows: List[int] = [5, 15]) -> pd.DataFrame:
    """
    Compute rolling volatility (standard deviation of returns)
    
    Args:
        returns: Series of returns
        windows: List of window sizes
        
    Returns:
        DataFrame with volatility columns
    """
    df = pd.DataFrame({"return": returns})
    
    for window in windows:
        df[f"volatility_{window}m"] = df["return"].rolling(window=window).std()
    
    return df


def compute_momentum(returns: pd.Series, windows: List[int] = [5, 15]) -> pd.DataFrame:
    """
    Compute momentum (rolling mean of returns)
    
    Args:
        returns: Series of returns
        windows: List of window sizes
        
    Returns:
        DataFrame with momentum columns
    """
    df = pd.DataFrame({"return": returns})
    
    for window in windows:
        df[f"momentum_{window}m"] = df["return"].rolling(window=window).mean()
    
    return df


def prepare_features_for_ml(prices: List[float]) -> Tuple[np.ndarray, np.ndarray]:
    """
    Prepare features for ML model (step-based like notebooks)
    
    Args:
        prices: List of normalized prices
        
    Returns:
        Tuple of (X, y) arrays for training
    """
    X = np.arange(len(prices)).reshape(-1, 1)
    y = np.array(prices)
    return X, y
