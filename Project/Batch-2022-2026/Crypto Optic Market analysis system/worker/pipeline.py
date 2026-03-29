"""
Pipeline for processing raw ticks into derived metrics, chart points, and predictions
"""

import sys
import os
from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
import pandas as pd
import numpy as np

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

# Import backend models and DB
from backend.models import RawTick, ChartPoint, Metric, Prediction
from backend.database import SessionLocal

# Import ML utilities
from ml.features import normalize_price, prepare_features_for_ml
from ml.model import CryptoPredictor


# ---------------------------------------------------------
# Utility: Safe Float for PostgreSQL DECIMAL
# ---------------------------------------------------------
def safe_float(value):
    """
    Convert value to float safely.
    Returns None if value is NaN, inf, or invalid.
    """
    if value is None:
        return None

    if isinstance(value, (int, float, np.number)):
        if np.isfinite(value):
            return float(value)
        else:
            return None

    return None


# ---------------------------------------------------------
# Compute Metrics
# ---------------------------------------------------------
def compute_metrics(coin: str, db: Session) -> Optional[Dict]:
    """
    Compute derived metrics (returns, volatility, momentum)
    Safely handles inf/NaN values.
    """

    points = (
        db.query(ChartPoint)
        .filter(ChartPoint.coin == coin)
        .order_by(desc(ChartPoint.ts))
        .limit(30)
        .all()
    )

    if len(points) < 5:
        return None

    prices = [float(p.normalized_price) for p in reversed(points)]
    timestamps = [p.ts for p in reversed(points)]

    df = pd.DataFrame({
        "price": prices,
        "ts": timestamps
    })

    # Compute returns
    df["return"] = df["price"].pct_change()

    # Remove inf/-inf
    df["return"] = df["return"].replace([np.inf, -np.inf], np.nan)

    # Rolling metrics
    df["volatility_5m"] = df["return"].rolling(window=5).std()
    df["volatility_15m"] = df["return"].rolling(window=15).std()
    df["momentum_5m"] = df["return"].rolling(window=5).mean()
    df["momentum_15m"] = df["return"].rolling(window=15).mean()

    latest = df.iloc[-1]

    return {
        "coin": coin,
        "ts": datetime.utcnow(),
        "return_1m": safe_float(df["return"].iloc[-1]),
        "return_5m": safe_float(df["return"].tail(5).mean()),
        "return_15m": safe_float(df["return"].tail(15).mean()),
        "volatility_5m": safe_float(latest["volatility_5m"]),
        "volatility_15m": safe_float(latest["volatility_15m"]),
        "momentum_5m": safe_float(latest["momentum_5m"]),
        "momentum_15m": safe_float(latest["momentum_15m"]),
    }


# ---------------------------------------------------------
# ML Inference
# ---------------------------------------------------------
def run_ml_inference(coin: str, db: Session) -> Optional[float]:

    points = (
        db.query(ChartPoint)
        .filter(ChartPoint.coin == coin)
        .order_by(desc(ChartPoint.ts))
        .limit(100)
        .all()
    )

    if len(points) < 10:
        return None

    prices = [float(p.normalized_price) for p in reversed(points)]

    try:
        X, y = prepare_features_for_ml(prices)

        predictor = CryptoPredictor(model_version=f"{coin}_v1")
        predictor.train(X, y)

        predicted = predictor.predict_next(len(prices))

        return safe_float(predicted)

    except Exception as e:
        print(f"ML inference error for {coin}: {e}")
        return None


# ---------------------------------------------------------
# Process Single Tick
# ---------------------------------------------------------
def process_tick(tick_data: Dict, db: Session):

    coin = tick_data["coin"]
    price = tick_data["price"]
    ts = tick_data["ts"]

    # 1. Insert raw tick
    raw_tick = RawTick(
        coin=coin,
        ts=ts,
        price=price,
        bid=tick_data.get("bid"),
        ask=tick_data.get("ask"),
        size=tick_data.get("size"),
        side=tick_data.get("side"),
        source="coinbase"
    )
    db.add(raw_tick)
    db.flush()

    # 2. Normalize and insert chart point
    recent_points = (
        db.query(ChartPoint)
        .filter(ChartPoint.coin == coin)
        .order_by(desc(ChartPoint.ts))
        .limit(100)
        .all()
    )

    recent_prices = [float(p.raw_price) for p in recent_points] if recent_points else []
    normalized_price = normalize_price(price, recent_prices)

    chart_point = (
        db.query(ChartPoint)
        .filter(ChartPoint.coin == coin, ChartPoint.ts == ts)
        .first()
    )

    if not chart_point:
        chart_point = ChartPoint(
            coin=coin,
            ts=ts,
            normalized_price=normalized_price,
            raw_price=price
        )
        db.add(chart_point)
    else:
        chart_point.normalized_price = normalized_price
        chart_point.raw_price = price

    db.flush()

    # 3. Metrics
    metrics_data = compute_metrics(coin, db)

    if metrics_data:
        metric = (
            db.query(Metric)
            .filter(Metric.coin == coin, Metric.ts == metrics_data["ts"])
            .first()
        )

        if not metric:
            metric = Metric(**metrics_data)
            db.add(metric)
        else:
            for key, value in metrics_data.items():
                if key not in ["coin", "ts"]:
                    setattr(metric, key, value)

    db.flush()

    # 4. Prediction
    predicted_price = run_ml_inference(coin, db)

    if predicted_price is not None:
        prediction = (
            db.query(Prediction)
            .filter(Prediction.coin == coin, Prediction.ts == ts)
            .first()
        )

        if not prediction:
            prediction = Prediction(
                coin=coin,
                ts=ts,
                predicted_normalized_price=predicted_price,
                model_version="v1"
            )
            db.add(prediction)
        else:
            prediction.predicted_normalized_price = predicted_price

    db.commit()
    print(f"✅ Processed {coin.upper()} tick at {ts}")


# ---------------------------------------------------------
# Process All Coins
# ---------------------------------------------------------
def process_all_coins(tick_data_dict: Dict[str, Dict]):

    db = SessionLocal()

    try:
        for coin, tick_data in tick_data_dict.items():
            if tick_data:
                process_tick(tick_data, db)

    except Exception as e:
        db.rollback()
        print(f"❌ Error processing ticks: {e}")
        raise

    finally:
        db.close()