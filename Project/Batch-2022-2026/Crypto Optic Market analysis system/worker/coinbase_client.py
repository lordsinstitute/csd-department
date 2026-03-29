"""
Coinbase API client for fetching current prices
Uses REST API for reliable scheduled fetches
"""
import httpx
from datetime import datetime
from typing import Dict, Optional

COINBASE_BASE_URL = "https://api.exchange.coinbase.com"

# Coin mappings: internal coin name -> Coinbase product ID
COIN_MAPPING = {
    "btc": "BTC-USD",
    "eth": "ETH-USD",
    "sol": "SOL-USD",
}


def fetch_ticker(coin: str) -> Optional[Dict]:
    """
    Fetch current ticker data for a coin from Coinbase
    
    Args:
        coin: Coin symbol (btc, eth, sol)
        
    Returns:
        Dict with price, bid, ask, size, side, or None if error
    """
    product_id = COIN_MAPPING.get(coin.lower())
    if not product_id:
        return None
    
    url = f"{COINBASE_BASE_URL}/products/{product_id}/ticker"
    
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)
            response.raise_for_status()
            data = response.json()
            
            return {
                "coin": coin.lower(),
                "price": float(data.get("price", 0)),
                "bid": float(data.get("bid", 0)),
                "ask": float(data.get("ask", 0)),
                "size": float(data.get("size", 0)),
                "side": data.get("side", "unknown"),
                "ts": datetime.utcnow(),
            }
    except Exception as e:
        print(f"Error fetching {coin} ticker: {e}")
        return None


def fetch_all_coins() -> Dict[str, Optional[Dict]]:
    """Fetch ticker data for all supported coins"""
    results = {}
    for coin in COIN_MAPPING.keys():
        results[coin] = fetch_ticker(coin)
    return results
