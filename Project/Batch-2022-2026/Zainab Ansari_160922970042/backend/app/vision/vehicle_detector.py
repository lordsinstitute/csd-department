# backend/app/vision/vehicle_detector.py

"""
YOLOv8 Vehicle Detection Module
Detects cars, trucks, buses, motorcycles in traffic videos
"""

import cv2
import numpy as np
from ultralytics import YOLO
import torch
from typing import List, Dict, Tuple
from pathlib import Path

class VehicleDetector:
    """
    YOLOv8-based real-time vehicle detection
    
    Detects: car, truck, bus, motorcycle
    Returns: bounding boxes, confidence, class, center points
    """
    
    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.45):
        """
        Initialize YOLOv8 detector
        
        Args:
            model_path: Path to YOLOv8 weights
            conf_threshold: Confidence threshold (0-1)
        """
        print(f"🔥 Initializing YOLOv8 Vehicle Detector...")
        
        # Load YOLO model
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
        
        # COCO dataset vehicle classes
        self.vehicle_classes = {
            2: 'car',
            3: 'motorcycle',
            5: 'bus',
            7: 'truck'
        }
        
        # Check for GPU
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"✅ Running on: {self.device.upper()}")
        print(f"✅ Model loaded: {model_path}")
        print(f"✅ Confidence threshold: {conf_threshold}")
    
    def detect(self, frame: np.ndarray) -> List[Dict]:
        """
        Detect vehicles in a single frame
        
        Args:
            frame: BGR image from OpenCV
        
        Returns:
            List of detections:
            [
                {
                    'bbox': [x1, y1, x2, y2],
                    'center': [cx, cy],
                    'confidence': 0.89,
                    'class': 'car',
                    'class_id': 2
                },
                ...
            ]
        """
        # Run inference
        results = self.model(
            frame,
            conf=self.conf_threshold,
            verbose=False
        )[0]
        
        detections = []
        
        for box in results.boxes:
            class_id = int(box.cls[0])
            
            # Only process vehicle classes
            if class_id in self.vehicle_classes:
                # Get bounding box
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Calculate center point
                cx = int((x1 + x2) / 2)
                cy = int((y1 + y2) / 2)
                
                detection = {
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'center': [cx, cy],
                    'confidence': float(box.conf[0]),
                    'class': self.vehicle_classes[class_id],
                    'class_id': class_id
                }
                
                detections.append(detection)
        
        return detections
    
    def detect_batch(self, frames: List[np.ndarray]) -> List[List[Dict]]:
        """
        Detect vehicles in multiple frames (batch processing)
        
        Args:
            frames: List of BGR images
        
        Returns:
            List of detection lists (one per frame)
        """
        all_detections = []
        
        for frame in frames:
            detections = self.detect(frame)
            all_detections.append(detections)
        
        return all_detections
    
    def draw_detections(self, frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """
        Draw bounding boxes and labels on frame
        
        Args:
            frame: Original frame
            detections: List of detections
        
        Returns:
            Annotated frame
        """
        annotated = frame.copy()
        
        # Color map for vehicle types (BGR)
        colors = {
            'car': (0, 255, 0),         # Green
            'motorcycle': (255, 0, 255), # Magenta
            'bus': (0, 0, 255),          # Red
            'truck': (0, 165, 255)       # Orange
        }
        
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            vehicle_class = det['class']
            confidence = det['confidence']
            color = colors.get(vehicle_class, (255, 255, 255))
            
            # Draw bounding box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label = f"{vehicle_class} {confidence:.2f}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            
            # Background for text
            cv2.rectangle(annotated, (x1, y1 - th - 10), (x1 + tw, y1), color, -1)
            
            # Text
            cv2.putText(
                annotated,
                label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                1
            )
        
        return annotated
    
    def get_statistics(self, detections: List[Dict]) -> Dict:
        """
        Get detection statistics
        
        Returns:
            {
                'total': 12,
                'cars': 8,
                'motorcycles': 2,
                'buses': 1,
                'trucks': 1,
                'avg_confidence': 0.87
            }
        """
        stats = {
            'total': len(detections),
            'cars': 0,
            'motorcycles': 0,
            'buses': 0,
            'trucks': 0,
            'avg_confidence': 0.0
        }
        
        if len(detections) == 0:
            return stats
        
        # Count by type
        for det in detections:
            vehicle_class = det['class']
            stats[f"{vehicle_class}s"] = stats.get(f"{vehicle_class}s", 0) + 1
        
        # Average confidence
        confidences = [d['confidence'] for d in detections]
        stats['avg_confidence'] = float(np.mean(confidences))
        
        return stats