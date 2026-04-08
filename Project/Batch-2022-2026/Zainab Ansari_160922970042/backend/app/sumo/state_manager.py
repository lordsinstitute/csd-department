"""State management for SUMO environment"""
import numpy as np

class StateManager:
    """Manages state extraction and normalization"""
    
    def __init__(self, lanes: list):
        self.lanes = lanes
        
    def normalize_queue(self, queue: int, max_queue: int = 10) -> float:
        """Normalize queue length"""
        return min(queue / max_queue, 1.0)
    
    def normalize_waiting(self, waiting: float, max_wait: int = 100) -> float:
        """Normalize waiting time"""
        return min(waiting / max_wait, 1.0)
    
    def normalize_occupancy(self, occupancy: float) -> float:
        """Normalize occupancy (already 0-1)"""
        return occupancy
    
    def normalize_count(self, count: int, max_count: int = 5) -> float:
        """Normalize vehicle count"""
        return min(count / max_count, 1.0)