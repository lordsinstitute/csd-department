"""
Test script to verify all imports work correctly
Run this from ds01-main directory: python test_imports.py
"""
import sys
import os

print("Testing imports...\n")

# Test backend imports
print("1. Testing backend imports...")
try:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
    from backend.database import get_db, SessionLocal
    from backend.models import ChartPoint, Prediction, RawTick, Metric, LLMInsightCache
    print("   [OK] Backend imports OK")
except Exception as e:
    print(f"   [ERROR] Backend import error: {e}")

# Test ML imports
print("\n2. Testing ML imports...")
try:
    sys.path.insert(0, os.path.dirname(__file__))
    from ml.features import normalize_price, prepare_features_for_ml
    from ml.model import CryptoPredictor
    print("   [OK] ML imports OK")
except Exception as e:
    print(f"   [ERROR] ML import error: {e}")

# Test database connection
print("\n3. Testing database connection...")
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "backend", ".env"))
    
    db = SessionLocal()
    # Try a simple query
    result = db.query(ChartPoint).limit(1).all()
    print("   [OK] Database connection OK")
    db.close()
except Exception as e:
    print(f"   [ERROR] Database connection error: {e}")
    print("   Make sure:")
    print("   - .env file exists in backend/ directory")
    print("   - DATABASE_URL is correct")
    print("   - Supabase schema has been run")

# Test worker imports
print("\n4. Testing worker imports...")
try:
    sys.path.insert(0, os.path.dirname(__file__))
    from worker.coinbase_client import fetch_ticker
    from worker.pipeline import process_tick
    print("   [OK] Worker imports OK")
except Exception as e:
    print(f"   [ERROR] Worker import error: {e}")

print("\n" + "="*50)
print("Import test complete!")
