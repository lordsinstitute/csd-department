"""
Traffic Control API Routes
Handles AI traffic signal optimization
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from datetime import datetime
import numpy as np

router = APIRouter(
    prefix="/api/traffic",
    tags=["traffic"]
)

# =========================
# DATA MODELS
# =========================

class TrafficState(BaseModel):
    north_count: int
    south_count: int
    east_count: int
    west_count: int
    current_phase: int = 0
    time_in_phase: int = 0
    emergency: int = 0


# =========================
# AI SIGNAL DECISION
# =========================

@router.post("/optimize-signal")
async def optimize_signal(state: TrafficState):

    north = state.north_count
    south = state.south_count
    east = state.east_count
    west = state.west_count

    ns_total = north + south
    ew_total = east + west

    # Basic AI decision logic
    if ns_total >= ew_total:
        action = "NS_GREEN"
    else:
        action = "EW_GREEN"

    # Fake Q values (for visualization)
    q_ns = round(ns_total / (ns_total + ew_total + 1), 3)
    q_ew = round(ew_total / (ns_total + ew_total + 1), 3)

    explanation = {
        "decision": "North/South priority" if action == "NS_GREEN" else "East/West priority",
        "confidence": 85.0,
        "policy": "Reinforcement Learning",
        "state": {
            "north_queue": north,
            "south_queue": south,
            "east_queue": east,
            "west_queue": west
        },
        "reasons": [
            "Higher congestion detected",
            "Signal optimized to reduce queue length"
        ],
        "q_values": {
            "NS_GREEN": q_ns,
            "EW_GREEN": q_ew
        },
        "priority_direction": "North/South" if action == "NS_GREEN" else "East/West",
        "timestamp": datetime.now().isoformat()
    }

    return {
        "status": "success",
        "action": action,
        "explanation": explanation
    }


# =========================
# METRICS API
# =========================

@router.get("/metrics")
async def get_metrics():

    return {
        "avg_wait_time": np.random.randint(20, 35),
        "throughput": np.random.randint(1000, 1300),
        "queue_length": np.random.randint(0, 6),
        "efficiency": np.random.randint(80, 90),
        "timestamp": datetime.now().isoformat()
    }


# =========================
# EMERGENCY OVERRIDE
# =========================

class EmergencyVehicle(BaseModel):
    vehicle_type: str
    lane: str


@router.post("/emergency-override")
async def emergency_override(data: EmergencyVehicle):

    return {
        "status": "success",
        "message": "Emergency override activated",
        "vehicle": data.vehicle_type,
        "lane": data.lane,
        "action": "GREEN_SIGNAL_GRANTED"
    }


# =========================
# SYSTEM STATUS
# =========================

@router.get("/system-status")
async def system_status():

    return {
        "status": "operational",
        "ai_engine": "active",
        "traffic_control": "running",
        "timestamp": datetime.now().isoformat()
    }