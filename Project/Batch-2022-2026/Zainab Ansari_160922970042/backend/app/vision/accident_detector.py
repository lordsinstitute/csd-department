"""
Accident Detection System - PRODUCTION VERSION
Detects vehicle collisions and stationary vehicles
"""

import numpy as np
from typing import Dict, List, Optional
from datetime import datetime

class AccidentDetector:
    def __init__(self, overlap_threshold: float = 0.3, stationary_frames: int = 5):
        """
        Initialize accident detector
        
        Args:
            overlap_threshold: IOU threshold for collision detection
            stationary_frames: Frames to consider vehicle stationary
        """
        self.overlap_threshold = overlap_threshold
        self.stationary_frames = stationary_frames
        
        # Track vehicle positions over time
        self.vehicle_history = {}  # {track_id: [positions]}
        self.stationary_vehicles = {}  # {track_id: stationary_count}
        self.detected_accidents = []
        
        print(f"✅ Accident detector initialized (threshold: {overlap_threshold})")
    
    def detect(self, detections: List[Dict]) -> Optional[Dict]:
        """
        Detect accidents from current frame detections
        
        Args:
            detections: List of tracked vehicle detections
            
        Returns:
            Accident information if detected, None otherwise
        """
        if not detections or len(detections) < 2:
            return None
        
        # Update vehicle histories
        self._update_history(detections)
        
        # Check for overlapping vehicles (collision)
        collision = self._check_collisions(detections)
        if collision:
            return collision
        
        # Check for stationary vehicles (possible accident aftermath)
        stationary = self._check_stationary_vehicles(detections)
        if stationary:
            return stationary
        
        return None
    
    def _update_history(self, detections: List[Dict]):
        """Update vehicle position history"""
        current_ids = set()
        
        for det in detections:
            track_id = det.get('track_id')
            if track_id is None:
                continue
            
            current_ids.add(track_id)
            bbox = det.get('bbox', [0, 0, 0, 0])
            center = self._get_center(bbox)
            
            if track_id not in self.vehicle_history:
                self.vehicle_history[track_id] = []
            
            self.vehicle_history[track_id].append(center)
            
            # Keep only last 10 positions
            if len(self.vehicle_history[track_id]) > 10:
                self.vehicle_history[track_id].pop(0)
        
        # Clean up old tracks
        old_ids = set(self.vehicle_history.keys()) - current_ids
        for old_id in old_ids:
            if old_id in self.vehicle_history:
                del self.vehicle_history[old_id]
            if old_id in self.stationary_vehicles:
                del self.stationary_vehicles[old_id]
    
    def _check_collisions(self, detections: List[Dict]) -> Optional[Dict]:
        """Check for overlapping bounding boxes"""
        for i in range(len(detections)):
            for j in range(i + 1, len(detections)):
                det1 = detections[i]
                det2 = detections[j]
                
                bbox1 = det1.get('bbox', [0, 0, 0, 0])
                bbox2 = det2.get('bbox', [0, 0, 0, 0])
                
                iou = self._calculate_iou(bbox1, bbox2)
                
                if iou > self.overlap_threshold:
                    # Collision detected
                    location = self._get_location(bbox1, bbox2)
                    
                    accident = {
                        'type': 'collision',
                        'location': location,
                        'vehicles_involved': [
                            det1.get('track_id', 'unknown'),
                            det2.get('track_id', 'unknown')
                        ],
                        'timestamp': datetime.now().timestamp(),
                        'severity': self._calculate_severity(iou),
                        'confidence': min(det1.get('confidence', 0), det2.get('confidence', 0)),
                        'vehicle_types': [
                            det1.get('class', 'unknown'),
                            det2.get('class', 'unknown')
                        ]
                    }
                    
                    self.detected_accidents.append(accident)
                    print(f"🚨 ACCIDENT DETECTED: {accident['location']}")
                    
                    return accident
        
        return None
    
    def _check_stationary_vehicles(self, detections: List[Dict]) -> Optional[Dict]:
        """Check for vehicles that haven't moved"""
        for det in detections:
            track_id = det.get('track_id')
            if track_id is None or track_id not in self.vehicle_history:
                continue
            
            history = self.vehicle_history[track_id]
            
            if len(history) < self.stationary_frames:
                continue
            
            # Check if vehicle moved in last N frames
            recent_positions = history[-self.stationary_frames:]
            movement = self._calculate_movement(recent_positions)
            
            if movement < 5:  # Less than 5 pixels movement
                if track_id not in self.stationary_vehicles:
                    self.stationary_vehicles[track_id] = 0
                
                self.stationary_vehicles[track_id] += 1
                
                # If stationary for too long, report as possible accident
                if self.stationary_vehicles[track_id] > self.stationary_frames * 2:
                    bbox = det.get('bbox', [0, 0, 0, 0])
                    location = self._get_location_from_bbox(bbox)
                    
                    accident = {
                        'type': 'stationary_vehicle',
                        'location': location,
                        'vehicles_involved': [track_id],
                        'timestamp': datetime.now().timestamp(),
                        'severity': 'low',
                        'confidence': det.get('confidence', 0),
                        'vehicle_types': [det.get('class', 'unknown')],
                        'stationary_frames': self.stationary_vehicles[track_id]
                    }
                    
                    # Reset counter to avoid repeated alerts
                    self.stationary_vehicles[track_id] = 0
                    
                    print(f"⚠️ STATIONARY VEHICLE: {location}")
                    return accident
            else:
                # Vehicle moved, reset counter
                if track_id in self.stationary_vehicles:
                    self.stationary_vehicles[track_id] = 0
        
        return None
    
    def _calculate_iou(self, bbox1: List[float], bbox2: List[float]) -> float:
        """Calculate Intersection over Union"""
        x1_1, y1_1, x2_1, y2_1 = bbox1
        x1_2, y1_2, x2_2, y2_2 = bbox2
        
        # Intersection
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i < x1_i or y2_i < y1_i:
            return 0.0
        
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
        
        # Union
        area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _get_center(self, bbox: List[float]) -> tuple:
        """Get center point of bounding box"""
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)
    
    def _calculate_movement(self, positions: List[tuple]) -> float:
        """Calculate total movement distance"""
        if len(positions) < 2:
            return 0.0
        
        total_distance = 0.0
        for i in range(1, len(positions)):
            dx = positions[i][0] - positions[i-1][0]
            dy = positions[i][1] - positions[i-1][1]
            distance = np.sqrt(dx**2 + dy**2)
            total_distance += distance
        
        return total_distance
    
    def _get_location(self, bbox1: List[float], bbox2: List[float]) -> str:
        """Determine accident location based on bounding boxes"""
        x1_center = (bbox1[0] + bbox1[2]) / 2
        x2_center = (bbox2[0] + bbox2[2]) / 2
        avg_x = (x1_center + x2_center) / 2
        
        # Assume frame is divided into lanes
        if avg_x < 400:
            return "West Lane"
        elif avg_x < 800:
            return "Center Intersection"
        elif avg_x < 1200:
            return "East Lane"
        else:
            return "Far East"
    
    def _get_location_from_bbox(self, bbox: List[float]) -> str:
        """Get location from single bbox"""
        x_center = (bbox[0] + bbox[2]) / 2
        
        if x_center < 400:
            return "West Lane"
        elif x_center < 800:
            return "Center Intersection"
        elif x_center < 1200:
            return "East Lane"
        else:
            return "Far East"
    
    def _calculate_severity(self, iou: float) -> str:
        """Calculate accident severity based on overlap"""
        if iou > 0.7:
            return "critical"
        elif iou > 0.5:
            return "high"
        elif iou > 0.3:
            return "medium"
        else:
            return "low"
    
    def get_accident_history(self) -> List[Dict]:
        """Get list of detected accidents"""
        return self.detected_accidents
    
    def reset(self):
        """Reset detector state"""
        self.vehicle_history.clear()
        self.stationary_vehicles.clear()
        self.detected_accidents.clear()
        print("♻️ Accident detector reset")