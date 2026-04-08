"""
Traffic Density Heatmap Generator
Creates real-time traffic density visualization
"""

import numpy as np
from typing import Dict, List

class HeatmapGenerator:
    def __init__(self, width: int = 1920, height: int = 1080, grid_size: int = 50):
        """
        Initialize heatmap generator
        
        Args:
            width: Frame width
            height: Frame height
            grid_size: Size of each grid cell in pixels
        """
        self.width = width
        self.height = height
        self.grid_size = grid_size
        
        self.grid_w = width // grid_size
        self.grid_h = height // grid_size
        
        # Initialize density grid
        self.density = np.zeros((self.grid_h, self.grid_w))
        self.decay_rate = 0.95  # Decay over time
        
    def update(self, detections: List[Dict]) -> np.ndarray:
        """
        Update heatmap with new detections
        
        Args:
            detections: List of vehicle detections with bbox
            
        Returns:
            Density heatmap as numpy array
        """
        # Decay existing density
        self.density *= self.decay_rate
        
        # Add new detections
        for det in detections:
            bbox = det['bbox']
            
            # Center of bounding box
            cx = int((bbox[0] + bbox[2]) / 2)
            cy = int((bbox[1] + bbox[3]) / 2)
            
            # Convert to grid coordinates
            gx = min(cx // self.grid_size, self.grid_w - 1)
            gy = min(cy // self.grid_size, self.grid_h - 1)
            
            # Increase density
            self.density[gy, gx] += 1.0
            
            # Spread to neighboring cells (Gaussian blur effect)
            for dy in [-1, 0, 1]:
                for dx in [-1, 0, 1]:
                    ny = gy + dy
                    nx = gx + dx
                    
                    if 0 <= ny < self.grid_h and 0 <= nx < self.grid_w:
                        weight = 0.5 if abs(dy) + abs(dx) == 1 else 0.25
                        self.density[ny, nx] += weight
        
        # Normalize to 0-1 range
        max_density = max(self.density.max(), 1.0)
        normalized = self.density / max_density
        
        return normalized
    
    def get_heatmap_data(self) -> Dict:
        """
        Get heatmap data for frontend visualization
        
        Returns:
            Dict with grid data and metadata
        """
        # Convert to list of grid cells with values
        cells = []
        for y in range(self.grid_h):
            for x in range(self.grid_w):
                if self.density[y, x] > 0.01:  # Only include non-zero cells
                    cells.append({
                        'x': x * self.grid_size,
                        'y': y * self.grid_size,
                        'width': self.grid_size,
                        'height': self.grid_size,
                        'density': float(self.density[y, x]),
                        'color': self._density_to_color(self.density[y, x])
                    })
        
        return {
            'cells': cells,
            'grid_size': self.grid_size,
            'max_density': float(self.density.max())
        }
    
    def _density_to_color(self, density: float) -> str:
        """Convert density value to color code"""
        # Normalize density (0-1)
        normalized = min(density / 5.0, 1.0)
        
        if normalized < 0.3:
            return 'blue'  # Low traffic
        elif normalized < 0.6:
            return 'yellow'  # Medium traffic
        else:
            return 'red'  # High congestions