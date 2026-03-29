# backend/app/vision/lane_counter.py

"""
Lane-based Vehicle Counter
Counts vehicles in North, South, East, West lanes
"""

import numpy as np
from typing import Dict, List, Tuple

class LaneCounter:
    """
    Count vehicles in intersection lanes using ROI (Region of Interest)
    
    Divides intersection into 4 lanes:
    - North (top)
    - South (bottom)
    - East (right)
    - West (left)
    """
    
    def __init__(self, frame_width: int, frame_height: int):
        """
        Initialize lane counter with frame dimensions
        
        Args:
            frame_width: Video width in pixels
            frame_height: Video height in pixels
        """
        self.width = frame_width
        self.height = frame_height
        
        # Define lane ROI as percentage of frame
        # Format: (x1_pct, y1_pct, x2_pct, y2_pct)
        self.lane_roi = {
            'north': (0.40, 0.00, 0.60, 0.35),  # Top 35%, center 20% width
            'south': (0.40, 0.65, 0.60, 1.00),  # Bottom 35%, center 20% width
            'east': (0.65, 0.40, 1.00, 0.60),   # Right 35%, center 20% height
            'west': (0.00, 0.40, 0.35, 0.60)    # Left 35%, center 20% height
        }
        
        print(f"✅ Lane Counter initialized")
        print(f"   Frame: {frame_width}x{frame_height}")
        print(f"   Lanes: North, South, East, West")
    
    def count_vehicles(self, detections: List[Dict]) -> Dict[str, int]:
        """
        Count vehicles in each lane
        
        Args:
            detections: List of vehicle detections with 'center' key
        
        Returns:
            {
                'north': 5,
                'south': 3,
                'east': 7,
                'west': 2
            }
        """
        counts = {
            'north': 0,
            'south': 0,
            'east': 0,
            'west': 0
        }
        
        for det in detections:
            cx, cy = det['center']
            
            # Check which lane this vehicle belongs to
            for lane_name, (x1_pct, y1_pct, x2_pct, y2_pct) in self.lane_roi.items():
                # Convert percentages to pixels
                x1 = int(x1_pct * self.width)
                y1 = int(y1_pct * self.height)
                x2 = int(x2_pct * self.width)
                y2 = int(y2_pct * self.height)
                
                # Check if vehicle center is in this lane
                if x1 <= cx <= x2 and y1 <= cy <= y2:
                    counts[lane_name] += 1
                    break  # Vehicle can only be in one lane
        
        return counts
    
    def get_lane_coordinates(self) -> Dict[str, Tuple[int, int, int, int]]:
        """
        Get pixel coordinates for each lane ROI
        
        Returns:
            {
                'north': (x1, y1, x2, y2),
                ...
            }
        """
        coords = {}
        
        for lane_name, (x1_pct, y1_pct, x2_pct, y2_pct) in self.lane_roi.items():
            x1 = int(x1_pct * self.width)
            y1 = int(y1_pct * self.height)
            x2 = int(x2_pct * self.width)
            y2 = int(y2_pct * self.height)
            coords[lane_name] = (x1, y1, x2, y2)
        
        return coords
    
    def draw_lanes(self, frame: np.ndarray, counts: Dict[str, int] = None) -> np.ndarray:
        """
        Draw lane ROIs on frame with vehicle counts
        
        Args:
            frame: Original frame
            counts: Optional vehicle counts per lane
        
        Returns:
            Annotated frame
        """
        annotated = frame.copy()
        
        # Lane colors (BGR)
        lane_colors = {
            'north': (255, 0, 0),   # Blue
            'south': (0, 255, 0),   # Green
            'east': (0, 0, 255),    # Red
            'west': (255, 255, 0)   # Cyan
        }
        
        coords = self.get_lane_coordinates()
        
        for lane_name, (x1, y1, x2, y2) in coords.items():
            color = lane_colors[lane_name]
            
            # Draw rectangle
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label = lane_name.upper()
            if counts:
                label += f": {counts[lane_name]}"
            
            cv2.putText(
                annotated,
                label,
                (x1 + 10, y1 + 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                color,
                2
            )
        
        return annotated