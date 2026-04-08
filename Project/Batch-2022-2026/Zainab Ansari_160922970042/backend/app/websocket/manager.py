"""
WebSocket Connection Manager - PRODUCTION VERSION
Handles real-time bidirectional communication
"""

from typing import List, Dict, Set
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        """Initialize WebSocket manager"""
        self.active_connections: List[WebSocket] = []
        self.connection_metadata: Dict[WebSocket, Dict] = {}
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
        
        print("✅ WebSocket Manager initialized")
    
    async def connect(self, websocket: WebSocket, client_id: str = None):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store metadata
        self.connection_metadata[websocket] = {
            'client_id': client_id or f"client_{len(self.active_connections)}",
            'connected_at': datetime.now().isoformat(),
            'message_count': 0
        }
        
        # Initialize subscriptions
        self.subscriptions[websocket] = set()
        
        print(f"✅ WebSocket connected: {self.connection_metadata[websocket]['client_id']}")
        print(f"📊 Total connections: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_personal_message({
            'type': 'connection_established',
            'client_id': self.connection_metadata[websocket]['client_id'],
            'message': 'Connected to NexusFlow WebSocket',
            'timestamp': datetime.now().isoformat()
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            client_id = self.connection_metadata.get(websocket, {}).get('client_id', 'unknown')
            self.active_connections.remove(websocket)
            
            if websocket in self.connection_metadata:
                del self.connection_metadata[websocket]
            
            if websocket in self.subscriptions:
                del self.subscriptions[websocket]
            
            print(f"❌ WebSocket disconnected: {client_id}")
            print(f"📊 Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        """Send message to specific client"""
        try:
            await websocket.send_json(message)
            
            if websocket in self.connection_metadata:
                self.connection_metadata[websocket]['message_count'] += 1
                
        except Exception as e:
            print(f"❌ Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict, exclude: WebSocket = None):
        """Broadcast message to all connected clients"""
        disconnected = []
        
        for connection in self.active_connections:
            if connection == exclude:
                continue
            
            try:
                await connection.send_json(message)
                
                if connection in self.connection_metadata:
                    self.connection_metadata[connection]['message_count'] += 1
                    
            except Exception as e:
                print(f"❌ Error broadcasting to client: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_to_channel(self, channel: str, message: Dict):
        """Broadcast to specific channel subscribers"""
        disconnected = []
        
        for connection in self.active_connections:
            if channel in self.subscriptions.get(connection, set()):
                try:
                    await connection.send_json(message)
                    
                    if connection in self.connection_metadata:
                        self.connection_metadata[connection]['message_count'] += 1
                        
                except Exception as e:
                    print(f"❌ Error broadcasting to channel {channel}: {e}")
                    disconnected.append(connection)
        
        # Clean up
        for connection in disconnected:
            self.disconnect(connection)
    
    def subscribe(self, websocket: WebSocket, channel: str):
        """Subscribe client to channel"""
        if websocket not in self.subscriptions:
            self.subscriptions[websocket] = set()
        
        self.subscriptions[websocket].add(channel)
        print(f"📡 Client subscribed to channel: {channel}")
    
    def unsubscribe(self, websocket: WebSocket, channel: str):
        """Unsubscribe client from channel"""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].discard(channel)
            print(f"📡 Client unsubscribed from channel: {channel}")
    
    def get_stats(self) -> Dict:
        """Get WebSocket statistics"""
        total_messages = sum(
            metadata.get('message_count', 0) 
            for metadata in self.connection_metadata.values()
        )
        
        return {
            'active_connections': len(self.active_connections),
            'total_messages_sent': total_messages,
            'clients': [
                {
                    'client_id': metadata.get('client_id'),
                    'connected_at': metadata.get('connected_at'),
                    'message_count': metadata.get('message_count', 0),
                    'subscriptions': list(self.subscriptions.get(ws, set()))
                }
                for ws, metadata in self.connection_metadata.items()
            ]
        }
    
    async def send_heartbeat(self):
        """Send heartbeat to all clients"""
        await self.broadcast({
            'type': 'heartbeat',
            'timestamp': datetime.now().isoformat(),
            'active_connections': len(self.active_connections)
        })

# Global instance
_ws_manager = WebSocketManager()

def get_ws_manager() -> WebSocketManager:
    """Get global WebSocket manager instance"""
    return _ws_manager