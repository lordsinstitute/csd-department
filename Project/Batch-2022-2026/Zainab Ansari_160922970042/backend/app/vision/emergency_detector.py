# backend/app/vision/emergency_detector.py

"""
Emergency Vehicle Detection
Detects ambulances, fire trucks, police cars
Uses color-based detection + YOLO for verification
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from .vehicle_detector import VehicleDetector

class EmergencyVehicleDetector:
    """
    Detect emergency vehicles using:
    1. Color detection (red/blue flashing lights)
    2. Vehicle type confirmation (YOLO)
    3. Siren detection (optional, audio)
    """
    
    def __init__(self):
        """Initialize emergency vehicle detector"""
        self.vehicle_detector = VehicleDetector()
        
        # HSV color ranges for emergency lights
        # Red (ambulance, fire truck)
        self.red_lower1 = np.array([0, 100, 100])
        self.red_upper1 = np.array([10, 255, 255])
        self.red_lower2 = np.array([160, 100, 100])
        self.red_upper2 = np.array([180, 255, 255])
        
        # Blue (police)
        self.blue_lower = np.array([100, 100, 100])
        self.blue_upper = np.array([130, 255, 255])
        
        print("✅ Emergency Vehicle Detector initialized")
        print("   Detection methods: Color + Shape + YOLO")
    
    def detect_emergency_lights(self, frame: np.ndarray) -> List[Tuple[int, int]]:
        """
        Detect red/blue flashing lights in frame
        
        Args:
            frame: BGR image
        
        Returns:
            List of (x, y) coordinates of detected lights
        """
        # Convert to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Detect red
        mask_red1 = cv2.inRange(hsv, self.red_lower1, self.red_upper1)
        mask_red2 = cv2.inRange(hsv, self.red_lower2, self.red_upper2)
        mask_red = cv2.bitwise_or(mask_red1, mask_red2)
        
        # Detect blue
        mask_blue = cv2.inRange(hsv, self.blue_lower, self.blue_upper)
        
        # Combine masks
        mask = cv2.bitwise_or(mask_red, mask_blue)
        
        # Find contours
        contours, _ = cv2.findContours(
            mask, 
            cv2.RETR_EXTERNAL, 
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        light_positions = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Filter by size (lights are usually small)
            if 50 < area < 5000:
                # Get center
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    light_positions.append((cx, cy))
        
        return light_positions
    
    def detect_emergency_vehicles(
        self, 
        frame: np.ndarray,
        detections: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """
        Detect emergency vehicles in frame
        
        Args:
            frame: BGR image
            detections: Optional pre-computed YOLO detections
        
        Returns:
            List of emergency vehicle detections:
            [
                {
                    'type': 'ambulance',
                    'bbox': [x1, y1, x2, y2],
                    'confidence': 0.92,
                    'has_lights': True,
                    'priority': 'high'
                },
                ...
            ]
        """
        # Get vehicle detections if not provided
        if detections is None:
            detections = self.vehicle_detector.detect(frame)
        
        # Get emergency light positions
        light_positions = self.detect_emergency_lights(frame)
        
        emergency_vehicles = []
        
        for det in detections:
            # Check if this is a bus or truck (emergency vehicles are usually large)
            if det['class'] in ['bus', 'truck']:
                x1, y1, x2, y2 = det['bbox']
                
                # Check if any emergency lights are near this vehicle
                has_lights = False
                for lx, ly in light_positions:
                    if x1 <= lx <= x2 and y1 <= ly <= y2:
                        has_lights = True
                        break
                
                if has_lights:
                    # This is likely an emergency vehicle
                    emergency_vehicle = {
                        'type': self._classify_emergency_type(det, frame),
                        'bbox': det['bbox'],
                        'center': det['center'],
                        'confidence': det['confidence'],
                        'has_lights': True,
                        'priority': 'high'
                    }
                    emergency_vehicles.append(emergency_vehicle)
        
        return emergency_vehicles
    
    def _classify_emergency_type(self, detection: Dict, frame: np.ndarray) -> str:
        """
        Classify emergency vehicle type based on color and shape
        
        Args:
            detection: Vehicle detection
            frame: Original frame
        
        Returns:
            'ambulance', 'fire_truck', or 'police'
        """
        x1, y1, x2, y2 = detection['bbox']
        
        # Crop vehicle region
        vehicle_crop = frame[y1:y2, x1:x2]
        
        if vehicle_crop.size == 0:
            return 'unknown'
        
        # Convert to HSV
        hsv = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2HSV)
        
        # Count red vs blue pixels
        red_mask1 = cv2.inRange(hsv, self.red_lower1, self.red_upper1)
        red_mask2 = cv2.inRange(hsv, self.red_lower2, self.red_upper2)
        red_mask = cv2.bitwise_or(red_mask1, red_mask2)
        blue_mask = cv2.inRange(hsv, self.blue_lower, self.blue_upper)
        
        red_pixels = cv2.countNonZero(red_mask)
        blue_pixels = cv2.countNonZero(blue_mask)
        
        # Classify based on dominant color
        if red_pixels > blue_pixels and red_pixels > 100:
            # Check aspect ratio to distinguish ambulance from fire truck
            width = x2 - x1
            height = y2 - y1
            aspect_ratio = width / height if height > 0 else 0
            
            if aspect_ratio > 2.0:
                return 'fire_truck'  # Fire trucks are longer
            else:
                return 'ambulance'
        elif blue_pixels > red_pixels and blue_pixels > 100:
            return 'police'
        else:
            return 'emergency_vehicle'
    
    def get_emergency_lane(self, emergency_vehicle: Dict, frame_shape: Tuple) -> str:
        """
        Determine which lane the emergency vehicle is approaching from
        
        Args:
            emergency_vehicle: Emergency vehicle detection
            frame_shape: (height, width, channels)
        
        Returns:
            'north', 'south', 'east', or 'west'
        """
        height, width = frame_shape[:2]
        cx, cy = emergency_vehicle['center']
        
        # Determine lane based on position
        # Top third = North
        if cy < height / 3:
            return 'north'
        # Bottom third = South
        elif cy > 2 * height / 3:
            return 'south'
        # Left third = West
        elif cx < width / 3:
            return 'west'
        # Right third = East
        elif cx > 2 * width / 3:
            return 'east'
        else:
            # Center - use closest edge
            distances = {
                'north': cy,
                'south': height - cy,
                'east': width - cx,
                'west': cx
            }
            return min(distances, key=distances.get)
    
    def draw_emergency_vehicles(
        self, 
        frame: np.ndarray, 
        emergency_vehicles: List[Dict]
    ) -> np.ndarray:
        """
        Draw emergency vehicle detections with priority indicators
        
        Args:
            frame: Original frame
            emergency_vehicles: List of emergency vehicle detections
        
        Returns:
            Annotated frame
        """
        annotated = frame.copy()
        
        for ev in emergency_vehicles:
            x1, y1, x2, y2 = ev['bbox']
            
            # Draw red bounding box (emergency priority)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 0, 255), 3)
            
            # Draw label
            label = f"🚨 {ev['type'].upper()}"
            (tw, th), _ = cv2.getTextSize(
                label, 
                cv2.FONT_HERSHEY_SIMPLEX, 
                0.7, 
                2
            )
            
            # Background for text
            cv2.rectangle(
                annotated,
                (x1, y1 - th - 15),
                (x1 + tw + 10, y1),
                (0, 0, 255),
                -1
            )
            
            # Text
            cv2.putText(
                annotated,
                label,
                (x1 + 5, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )
            
            # Draw flashing effect
            if ev.get('has_lights'):
                cv2.circle(
                    annotated, 
                    (x1 + 20, y1 - 20), 
                    10, 
                    (0, 0, 255), 
                    -1
                )
        
        return annotated