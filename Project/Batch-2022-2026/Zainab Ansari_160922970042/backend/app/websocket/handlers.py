"""
WebSocket Message Handlers
Routes incoming WebSocket messages to appropriate handlers
"""

from typing import Dict
from fastapi import WebSocket
from .manager import WebSocketManager

async def handle_message(websocket: WebSocket, message: Dict, manager: WebSocketManager):
    """
    Route incoming WebSocket messages
    
    Message types:
    - ping: Heartbeat check
    - subscribe: Subscribe to channel
    - unsubscribe: Unsubscribe from channel
    - get_stats: Get connection statistics
    """
    msg_type = message.get('type')
    
    if msg_type == 'ping':
        await handle_ping(websocket, message, manager)
    
    elif msg_type == 'subscribe':
        await handle_subscribe(websocket, message, manager)
    
    elif msg_type == 'unsubscribe':
        await handle_unsubscribe(websocket, message, manager)
    
    elif msg_type == 'get_stats':
        await handle_get_stats(websocket, message, manager)
    
    else:
        await manager.send_personal_message({
            'type': 'error',
            'message': f'Unknown message type: {msg_type}'
        }, websocket)

async def handle_ping(websocket: WebSocket, message: Dict, manager: WebSocketManager):
    """Handle ping message"""
    await manager.send_personal_message({
        'type': 'pong',
        'timestamp': message.get('timestamp')
    }, websocket)

async def handle_subscribe(websocket: WebSocket, message: Dict, manager: WebSocketManager):
    """Handle channel subscription"""
    channel = message.get('channel')
    
    if channel:
        manager.subscribe(websocket, channel)
        await manager.send_personal_message({
            'type': 'subscribed',
            'channel': channel,
            'message': f'Subscribed to {channel}'
        }, websocket)
    else:
        await manager.send_personal_message({
            'type': 'error',
            'message': 'Channel name required'
        }, websocket)

async def handle_unsubscribe(websocket: WebSocket, message: Dict, manager: WebSocketManager):
    """Handle channel unsubscription"""
    channel = message.get('channel')
    
    if channel:
        manager.unsubscribe(websocket, channel)
        await manager.send_personal_message({
            'type': 'unsubscribed',
            'channel': channel,
            'message': f'Unsubscribed from {channel}'
        }, websocket)

async def handle_get_stats(websocket: WebSocket, message: Dict, manager: WebSocketManager):
    """Handle stats request"""
    stats = manager.get_stats()
    await manager.send_personal_message({
        'type': 'stats',
        'data': stats
    }, websocket)