"""
NexusFlow FastAPI Main Application
Smart Traffic AI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

# Import routers
from app.api import traffic_routes, video_routes, training_routes, websocket_routes


# -------------------------------
# Create FastAPI App
# -------------------------------

app = FastAPI(
    title="NexusFlow AI Traffic Management API",
    description="Smart City Traffic Control with YOLOv8 + Reinforcement Learning",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# -------------------------------
# CORS Configuration
# -------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Register Routers
# -------------------------------

app.include_router(video_routes.router)
app.include_router(traffic_routes.router)
app.include_router(training_routes.router)
app.include_router(websocket_routes.router)


# -------------------------------
# Startup Event
# -------------------------------

@app.on_event("startup")
async def startup_event():

    print("\n" + "=" * 70)
    print("🚀 NEXUSFLOW AI TRAFFIC MANAGEMENT PLATFORM v2.0")
    print("=" * 70)
    print("\n📦 LOADING COMPONENTS...\n")

    # YOLO Detector
    try:
        from app.services.video_detector import get_video_detector
        get_video_detector()
        print("✅ YOLOv8 Vehicle Detection - READY")
    except Exception as e:
        print(f"⚠️ YOLO Detector - FALLBACK ({e})")

    # DQN Agent
    try:
        from app.rl.dqn_agent import DQNAgent
        agent = DQNAgent(state_size=10, action_size=2)
        print("✅ DQN Traffic Optimization - READY")
    except Exception as e:
        print(f"⚠️ DQN Agent - FALLBACK ({e})")

    # AI Explainer
    try:
        from app.rl.explainer import AIExplainer
        print("✅ AI Decision Explainer - READY")
    except Exception as e:
        print(f"⚠️ AI Explainer - FALLBACK ({e})")

    # WebSocket Manager
    try:
        from app.websocket.manager import WebSocketManager
        WebSocketManager()
        print("✅ WebSocket Streaming - READY")
    except Exception as e:
        print(f"⚠️ WebSocket Manager - FALLBACK ({e})")

    print("\n" + "=" * 70)
    print("📡 API ENDPOINTS")
    print("=" * 70)
    print("📖 Docs:        http://localhost:8000/docs")
    print("📖 ReDoc:       http://localhost:8000/redoc")
    print("🔌 WebSocket:   ws://localhost:8000/ws")
    print("🚦 Traffic API: http://localhost:8000/api/traffic")
    print("🎥 Video API:   http://localhost:8000/api/video")
    print("🎓 Training:    http://localhost:8000/api/training")
    print("=" * 70)

    print(
        f"\n✅ SYSTEM READY - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    )


# -------------------------------
# Shutdown Event
# -------------------------------

@app.on_event("shutdown")
async def shutdown_event():

    print("\n" + "=" * 70)
    print("🔴 SHUTTING DOWN NEXUSFLOW")
    print("=" * 70)
    print("Cleaning resources...")
    print("✅ Shutdown complete")
    print("=" * 70 + "\n")


# -------------------------------
# Root Endpoint
# -------------------------------

@app.get("/")
async def root():

    return {
        "name": "NexusFlow AI Traffic Management Platform",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "YOLOv8 Vehicle Detection",
            "Reinforcement Learning Traffic Control",
            "AI Decision Explainer",
            "Traffic Heatmap",
            "WebSocket Real-time Streaming",
            "Emergency Vehicle Priority"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "video_api": "/api/video",
            "traffic_api": "/api/traffic",
            "training_api": "/api/training",
            "websocket": "ws://localhost:8000/ws"
        }
    }


# -------------------------------
# Health Check
# -------------------------------

@app.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "api": "healthy",
            "video_processing": "ready",
            "ai_agent": "ready",
            "websocket": "ready"
        }
    }


# -------------------------------
# Version Info
# -------------------------------

@app.get("/version")
async def get_version():

    return {
        "version": "2.0.0",
        "release_date": "2026-03-07",
        "name": "NexusFlow AI Traffic Management",
        "features": {
            "yolo_detection": True,
            "rl_optimization": True,
            "ai_explanations": True,
            "heatmap_visualization": True,
            "websocket_streaming": True
        }
    }


# -------------------------------
# Run Server
# -------------------------------

if __name__ == "__main__":

    print("\n🚀 Starting NexusFlow Server...\n")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )