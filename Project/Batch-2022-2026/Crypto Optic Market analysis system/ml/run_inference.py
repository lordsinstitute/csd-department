import os
import sys
from datetime import datetime

# Add project root to path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from backend.database import SessionLocal
from backend.models import ChartPoint, Prediction
from ml.model import predict_next_price


def run_prediction_for_coin(coin: str):
    db = SessionLocal()
    try:
        points = (
            db.query(ChartPoint)
            .filter(ChartPoint.coin == coin)
            .order_by(ChartPoint.ts.asc())
            .all()
        )

        if len(points) < 10:
            print(f"Not enough data for {coin}")
            return

        prices = [float(p.normalized_price) for p in points]

        predicted = predict_next_price(coin, prices)

        if predicted is None:
            print(f"Prediction failed for {coin}")
            return

        new_prediction = Prediction(
            coin=coin,
            ts=datetime.utcnow(),
            predicted_normalized_price=predicted,
            model_version="v1",
        )

        db.add(new_prediction)
        db.commit()

        print(f"Inserted prediction for {coin}: {predicted}")

    except Exception as e:
        print(f"Error running prediction for {coin}: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    for coin in ["btc", "eth", "sol"]:
        run_prediction_for_coin(coin)