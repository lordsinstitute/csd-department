"""
WebSocket API Routes - PRODUCTION VERSION
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import get_ws_manager
from app.websocket.handlers import handle_message
import asyncio
from datetime import datetime

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Main WebSocket endpoint
    
    Supported channels:
    - vehicle_counts: Real-time vehicle counting
    - detections: YOLO detection results
    - signal_decisions: Traffic signal decisions
    - training_metrics: RL training updates
    - simulation_metrics: Simulation state
    - accidents: Accident alerts
    - heatmap: Traffic density heatmap
    """
    manager = get_ws_manager()
    
    # Accept connection
    await manager.connect(websocket)
    
    # Start heartbeat task
    async def send_heartbeats():
        while True:
            try:
                await asyncio.sleep(30)
                await manager.send_heartbeat()
            except:
                break
    
    heartbeat_task = asyncio.create_task(send_heartbeats())
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Handle message
            await handle_message(websocket, data, manager)
            
    except WebSocketDisconnect:
        print("🔌 Client disconnected")
        manager.disconnect(websocket)
        heartbeat_task.cancel()
        
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        manager.disconnect(websocket)
        heartbeat_task.cancel()

@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    manager = get_ws_manager()
    return manager.get_stats()

# Export manager for other modules
def get_ws_manager():
    """Get WebSocket manager instance"""
    from app.websocket.manager import get_ws_manager as _get_manager
    return _get_manager()