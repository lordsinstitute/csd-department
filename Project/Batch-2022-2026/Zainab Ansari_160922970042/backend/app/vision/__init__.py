# backend/app/vision/__init__.py

"""
Computer Vision Module
YOLOv8 vehicle detection and lane counting
"""

from .vehicle_detector import VehicleDetector
from .lane_counter import LaneCounter
from .video_processor import VideoProcessor
from .emergency_detector import EmergencyVehicleDetector

__all__ = [
    'VehicleDetector',
    'LaneCounter', 
    'VideoProcessor',
    'EmergencyVehicleDetector'
]

# Singleton instances
_vehicle_detector = None
_emergency_detector = None

def get_vehicle_detector() -> VehicleDetector:
    """Get singleton vehicle detector"""
    global _vehicle_detector
    if _vehicle_detector is None:
        _vehicle_detector = VehicleDetector()
    return _vehicle_detector

def get_emergency_detector() -> EmergencyVehicleDetector:
    """Get singleton emergency detector"""
    global _emergency_detector
    if _emergency_detector is None:
        _emergency_detector = EmergencyVehicleDetector()
    return _emergency_detector