from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import asyncio
import time
import random
import math
from llm.insight_generator import generate_insight

app = FastAPI(title="CryptoVista Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/{coin}/chart")
async def get_chart(coin: str):
    # Mock historical data for the chart
    now = int(time.time())
    base_price = {"btc": 60000, "eth": 3000, "sol": 150}.get(coin.lower(), 100)
    
    data = []
    for i in range(100):
        t = now - (100 - i) * 60
        # Create an explicitly wide spread: generate a random progress value (0 to 1) 
        # and stretch it across base_price to base_price * 2
        progress = random.uniform(0.0, 1.0)
        val = base_price * (1.0 + progress)
        data.append({"time": t, "value": val})
        
    return data

@app.get("/{coin}/prediction")
async def get_prediction(coin: str):
    base_price = {"btc": 60000, "eth": 3000, "sol": 150}.get(coin.lower(), 100)
    return {"predicted_normalized_price": base_price + random.uniform(0, base_price*0.05)}

@app.get("/llm/{coin}-summary")
async def get_llm_summary(coin: str):
    insight = generate_insight(coin)
    return {"insight": insight}

async def price_generator(coin: str):
    base_price = {"btc": 60000, "eth": 3000, "sol": 150}.get(coin.lower(), 100)
    while True:
        await asyncio.sleep(2)
        progress = random.uniform(0.0, 1.0)
        val = base_price * (1.0 + progress)
        
        yield {
            "event": "message",
            "data": f'{{"time": {int(time.time())}, "value": {val}}}'
        }

@app.get("/api/stream/{coin}")
async def stream_price(coin: str):
    return EventSourceResponse(price_generator(coin))
