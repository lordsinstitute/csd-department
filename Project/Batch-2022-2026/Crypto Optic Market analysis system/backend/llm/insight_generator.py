import os
import json
import urllib.request

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def generate_insight(coin: str):
    coin_name = {
        "btc": "Bitcoin (BTC)",
        "eth": "Ethereum (ETH)",
        "sol": "Solana (SOL)"
    }.get(coin.lower(), coin.upper())

    # Look for GEMINI_API_KEY in .env
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        api_key = api_key.strip()
    
    fallback = {
        "market_regime": "Trending",
        "momentum": "Strong Bullish",
        "volatility_state": "High",
        "risk_outlook": "Moderate",
        "key_insight": f"{coin_name} is showing strong institutional accumulation with rising on-chain activity.",
        "caution": "Global macro headwinds might cause short-term pullbacks."
    }

    if not api_key:
        print("Warning: GEMINI_API_KEY not found in .env. Using fallback.")
        return fallback

    prompt = f"Provide a brief market insight for {coin_name}. Return ONLY a JSON object with the following keys: 'market_regime', 'momentum', 'volatility_state', 'risk_outlook', 'key_insight', 'caution'. Return no other text."

    # Direct call to Google Gemini API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = json.loads(response.read().decode("utf-8"))
            
            # Extract content from Gemini response structure
            content = response_data['candidates'][0]['content']['parts'][0]['text']
            
            # Clean up potential markdown formatting
            content = content.replace("```json", "").replace("```", "").strip()
            insight = json.loads(content)
            
            # Merge with fallback to ensure all structured keys exist
            for k in fallback:
                if k not in insight:
                    insight[k] = fallback[k]
                    
            return insight
    except Exception as e:
        print(f"Error fetching insight from Gemini API: {e}")
        return fallback
