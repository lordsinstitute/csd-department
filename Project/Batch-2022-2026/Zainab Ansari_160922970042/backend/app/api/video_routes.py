"""
RL Training API Routes - FINAL STABLE VERSION
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
import asyncio
from datetime import datetime
import time
import random

router = APIRouter(prefix="/api/training", tags=["training"])


# -----------------------------
# Training State
# -----------------------------

training_state = {
    "is_training": False,
    "is_paused": False,
    "current_episode": 0,
    "total_episodes": 0,

    "metrics": {
        "episode": 0,
        "reward": 0.0,
        "loss": 0.0,
        "epsilon": 1.0,
        "replay_memory_size": 0,
        "training_time": 0.0,
        "progress": 0
    },

    "history": {
        "episodes": [],
        "rewards": [],
        "losses": [],
        "epsilon": []
    }
}


# -----------------------------
# Request Model
# -----------------------------

class TrainingRequest(BaseModel):
    num_episodes: int = 100


# -----------------------------
# Training Loop
# -----------------------------

async def training_loop(num_episodes: int):

    training_state["is_training"] = True
    training_state["is_paused"] = False
    training_state["total_episodes"] = num_episodes
    training_state["current_episode"] = 0

    start_time = time.time()

    # WebSocket Manager
    try:
        from app.api.websocket_routes import get_ws_manager
        ws_manager = get_ws_manager()
    except:
        ws_manager = None

    for episode in range(1, num_episodes + 1):

        if not training_state["is_training"]:
            break

        # Pause handling
        while training_state["is_paused"]:
            await asyncio.sleep(0.2)
            if not training_state["is_training"]:
                break

        # Simulated RL metrics
        reward = random.uniform(-50, 100) + episode * 0.5
        loss = max(0.1, 2.0 - episode * 0.01)
        epsilon = max(0.01, 1.0 - episode * 0.01)

        elapsed = time.time() - start_time

        training_state["current_episode"] = episode

        progress = round((episode / num_episodes) * 100, 2)

        training_state["metrics"] = {
            "episode": episode,
            "reward": round(reward, 2),
            "loss": round(loss, 4),
            "epsilon": round(epsilon, 3),
            "replay_memory_size": min(episode * 10, 1000),
            "training_time": round(elapsed, 1),
            "progress": progress
        }

        # Save history (limit size)
        history = training_state["history"]

        history["episodes"].append(episode)
        history["rewards"].append(round(reward, 2))
        history["losses"].append(round(loss, 4))
        history["epsilon"].append(round(epsilon, 3))

        # Limit history length (avoid memory issues)
        max_history = 500

        for key in history:
            if len(history[key]) > max_history:
                history[key] = history[key][-max_history:]

        # WebSocket broadcast
        if ws_manager:
            try:
                await ws_manager.broadcast({
                    "type": "training_update",
                    "data": training_state["metrics"]
                })
            except:
                pass

        await asyncio.sleep(0.5)

    training_state["is_training"] = False

    print(f"✅ Training finished: {training_state['current_episode']} episodes")


# -----------------------------
# Start Training
# -----------------------------

@router.post("/start")
async def start_training(request: TrainingRequest, background_tasks: BackgroundTasks):

    if training_state["is_training"]:
        raise HTTPException(
            status_code=400,
            detail="Training already in progress"
        )

    # Reset history
    training_state["history"] = {
        "episodes": [],
        "rewards": [],
        "losses": [],
        "epsilon": []
    }

    background_tasks.add_task(training_loop, request.num_episodes)

    return {
        "status": "success",
        "message": f"Training started for {request.num_episodes} episodes"
    }


# -----------------------------
# Pause Training
# -----------------------------

@router.post("/pause")
async def pause_training():

    if not training_state["is_training"]:
        raise HTTPException(400, "No active training")

    training_state["is_paused"] = True

    return {"status": "success", "message": "Training paused"}


# -----------------------------
# Resume Training
# -----------------------------

@router.post("/resume")
async def resume_training():

    if not training_state["is_training"]:
        raise HTTPException(400, "No active training")

    training_state["is_paused"] = False

    return {"status": "success", "message": "Training resumed"}


# -----------------------------
# Stop Training
# -----------------------------

@router.post("/stop")
async def stop_training():

    if not training_state["is_training"]:
        raise HTTPException(400, "No active training")

    training_state["is_training"] = False
    training_state["is_paused"] = False

    return {"status": "success", "message": "Training stopped"}


# -----------------------------
# Metrics Endpoint
# -----------------------------

@router.get("/metrics")
async def get_training_metrics():

    progress = 0

    if training_state["total_episodes"] > 0:
        progress = (
            training_state["current_episode"]
            / training_state["total_episodes"]
        ) * 100

    return {
        "current": training_state["metrics"],
        "history": training_state["history"],
        "status": {
            "is_training": training_state["is_training"],
            "is_paused": training_state["is_paused"],
            "progress": round(progress, 2)
        }
    }


# -----------------------------
# Status Endpoint
# -----------------------------

@router.get("/status")
async def get_training_status():

    return {
        "is_training": training_state["is_training"],
        "is_paused": training_state["is_paused"],
        "current_episode": training_state["current_episode"],
        "total_episodes": training_state["total_episodes"]
    }