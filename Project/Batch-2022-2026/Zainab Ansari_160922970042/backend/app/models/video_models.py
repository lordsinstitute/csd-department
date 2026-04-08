# backend/app/models/video_models.py

"""
Pydantic Models for Video Processing API
Defines request/response schemas
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class VideoUploadResponse(BaseModel):
    """Response after video upload"""
    success: bool
    filename: str
    size_mb: float
    video_info: Dict

class VideoFrameResponse(BaseModel):
    """Response from processing a frame"""
    success: bool
    frame_number: int
    timestamp: float
    lane_counts: Dict[str, int]
    state_vector: List[float]
    total_vehicles: int
    statistics: Dict

class DQNActionRequest(BaseModel):
    """Request to apply DQN action"""
    action: int = Field(..., ge=0, le=1, description="0 = keep, 1 = switch")

class DQNActionResponse(BaseModel):
    """Response after applying action"""
    success: bool
    action: int
    current_phase: int
    time_in_phase: float

class VideoInfoResponse(BaseModel):
    """Video information response"""
    filename: str
    width: int
    height: int
    fps: int
    total_frames: int
    duration: float
    current_frame: int
    progress_percent: float