# backend/app/services/state_generator.py

"""
State Generator Service
"""

import numpy as np
from typing import Dict, List, Tuple
from pathlib import Path

# No imports needed from app - this file is self-contained!
# Remove: sys.path.insert(0, str(Path(__file__).parent.parent))

# ... rest of your code stays the same ...
sys.path.insert(0, str(Path(__file__).parent.parent))

class StateGenerator:
    """
    Generate DQN-compatible state vectors from video processing results
    
    State Format (10 elements):
    [N_queue, S_queue, E_queue, W_queue, N_wait, S_wait, E_wait, W_wait, phase, time_in_phase]
    
    This matches your existing simulation state format!
    """
    
    def __init__(self, normalize: bool = True):
        """
        Initialize state generator
        
        Args:
            normalize: Whether to normalize state values to [0, 1]
        """
        self.normalize = normalize
        
        # Normalization parameters (adjust based on your scenario)
        self.max_queue_length = 20  # Maximum expected vehicles per lane
        self.max_waiting_time = 120  # Maximum waiting time in seconds
        self.max_phase_time = 60  # Maximum time in one phase
        
        # State history for temporal features (optional)
        self.state_history: List[np.ndarray] = []
        self.history_length = 5  # Keep last 5 states
        
        print("✅ State Generator initialized")
        print(f"   Normalization: {normalize}")
        print(f"   Max queue: {self.max_queue_length}")
        print(f"   Max wait: {self.max_waiting_time}s")
    
    def generate_state_from_video(
        self, 
        lane_counts: Dict[str, int],
        timestamp: float,
        current_phase: int = 0,
        time_in_phase: float = 0.0
    ) -> np.ndarray:
        """
        Generate DQN state vector from video processing results
        
        Args:
            lane_counts: Vehicle counts per lane
                Example: {'north': 5, 'south': 3, 'east': 7, 'west': 2}
            timestamp: Current video timestamp in seconds
            current_phase: Current signal phase (0=NS green, 1=EW green)
            time_in_phase: Time elapsed in current phase (seconds)
        
        Returns:
            State vector as numpy array of shape (10,)
            Compatible with your existing DQN agent!
        """
        # Extract lane counts
        north_queue = lane_counts.get('north', 0)
        south_queue = lane_counts.get('south', 0)
        east_queue = lane_counts.get('east', 0)
        west_queue = lane_counts.get('west', 0)
        
        # Estimate waiting times based on queue length
        # Heuristic: waiting_time = queue_length * average_service_time
        north_wait = self._estimate_waiting_time(north_queue)
        south_wait = self._estimate_waiting_time(south_queue)
        east_wait = self._estimate_waiting_time(east_queue)
        west_wait = self._estimate_waiting_time(west_queue)
        
        # Build state vector (10 elements)
        state = np.array([
            north_queue,      # Index 0: North queue length
            south_queue,      # Index 1: South queue length
            east_queue,       # Index 2: East queue length
            west_queue,       # Index 3: West queue length
            north_wait,       # Index 4: North waiting time
            south_wait,       # Index 5: South waiting time
            east_wait,        # Index 6: East waiting time
            west_wait,        # Index 7: West waiting time
            current_phase,    # Index 8: Current phase (0 or 1)
            time_in_phase     # Index 9: Time in current phase
        ], dtype=np.float32)
        
        # Normalize if enabled
        if self.normalize:
            state = self._normalize_state(state)
        
        # Update history
        self._update_history(state)
        
        return state
    
    def _estimate_waiting_time(self, queue_length: int) -> float:
        """
        Estimate average waiting time based on queue length
        
        Uses a simple heuristic: waiting_time ≈ queue_length × average_service_time
        
        Args:
            queue_length: Number of vehicles in queue
        
        Returns:
            Estimated waiting time in seconds
        """
        if queue_length == 0:
            return 0.0
        
        # Heuristic parameters
        avg_service_time = 4.0  # Seconds per vehicle
        
        # Linear estimation
        estimated_wait = queue_length * avg_service_time
        
        # Cap at maximum to prevent unrealistic values
        return min(estimated_wait, self.max_waiting_time)
    
    def _normalize_state(self, state: np.ndarray) -> np.ndarray:
        """
        Normalize state values to [0, 1] range
        
        This helps DQN training by keeping all inputs in similar scale
        
        Args:
            state: Raw state vector
        
        Returns:
            Normalized state vector
        """
        normalized = state.copy()
        
        # Normalize queue lengths (indices 0-3)
        normalized[0:4] = np.clip(state[0:4] / self.max_queue_length, 0, 1)
        
        # Normalize waiting times (indices 4-7)
        normalized[4:8] = np.clip(state[4:8] / self.max_waiting_time, 0, 1)
        
        # Phase is already binary (0 or 1), keep as-is (index 8)
        normalized[8] = state[8]
        
        # Normalize time in phase (index 9)
        normalized[9] = np.clip(state[9] / self.max_phase_time, 0, 1)
        
        return normalized
    
    def _update_history(self, state: np.ndarray):
        """
        Update state history buffer
        
        Maintains a sliding window of recent states
        Useful for temporal analysis or LSTM models
        
        Args:
            state: New state to add to history
        """
        self.state_history.append(state.copy())
        
        # Keep only last N states
        if len(self.state_history) > self.history_length:
            self.state_history.pop(0)
    
    def generate_state_batch(
        self, 
        video_results: List[Dict]
    ) -> List[np.ndarray]:
        """
        Generate state vectors for multiple frames
        
        Useful for batch processing of video frames
        
        Args:
            video_results: List of frame processing results
                Each result should contain 'lane_counts' and 'timestamp'
        
        Returns:
            List of state vectors
        """
        states = []
        
        for i, result in enumerate(video_results):
            # Estimate current phase based on time
            # Simple alternation: 60s green, 3s yellow per direction
            cycle_time = 126  # (60+3) × 2 = 126 seconds per full cycle
            time_in_cycle = result['timestamp'] % cycle_time
            
            if time_in_cycle < 60:
                current_phase = 0  # NS green
                time_in_phase = time_in_cycle
            elif time_in_cycle < 63:
                current_phase = 0  # NS yellow (still phase 0)
                time_in_phase = time_in_cycle
            elif time_in_cycle < 123:
                current_phase = 1  # EW green
                time_in_phase = time_in_cycle - 63
            else:
                current_phase = 1  # EW yellow (still phase 1)
                time_in_phase = time_in_cycle - 123
            
            # Generate state
            state = self.generate_state_from_video(
                lane_counts=result['lane_counts'],
                timestamp=result['timestamp'],
                current_phase=current_phase,
                time_in_phase=time_in_phase
            )
            
            states.append(state)
        
        return states
    
    def get_temporal_features(self) -> np.ndarray:
        """
        Get temporal features from state history
        
        Returns stacked state history for LSTM or attention-based models
        
        Returns:
            Stacked state history of shape (history_length, state_dim)
        """
        if len(self.state_history) < self.history_length:
            # Pad with zeros if not enough history
            if len(self.state_history) > 0:
                padding = [np.zeros_like(self.state_history[0])] * \
                          (self.history_length - len(self.state_history))
                return np.stack(padding + self.state_history)
            else:
                return np.zeros((self.history_length, 10))
        
        return np.stack(self.state_history)
    
    def get_congestion_score(self, state: np.ndarray) -> float:
        """
        Calculate overall congestion score from state
        
        Useful for metrics and visualization
        
        Args:
            state: State vector (normalized or not)
        
        Returns:
            Congestion score in [0, 1] where 1 is maximum congestion
        """
        if self.normalize:
            # State is already normalized
            queue_score = np.mean(state[0:4])
            wait_score = np.mean(state[4:8])
        else:
            # Normalize on the fly
            queue_score = np.mean(state[0:4]) / self.max_queue_length
            wait_score = np.mean(state[4:8]) / self.max_waiting_time
        
        # Weighted average (queues weighted more heavily)
        congestion = 0.6 * queue_score + 0.4 * wait_score
        
        return float(np.clip(congestion, 0, 1))
    
    def get_state_description(self, state: np.ndarray) -> Dict:
        """
        Get human-readable description of state
        
        Args:
            state: State vector
        
        Returns:
            Dictionary with state description
        """
        # Denormalize if needed
        if self.normalize:
            denorm_state = state.copy()
            denorm_state[0:4] = state[0:4] * self.max_queue_length
            denorm_state[4:8] = state[4:8] * self.max_waiting_time
            denorm_state[9] = state[9] * self.max_phase_time
        else:
            denorm_state = state
        
        return {
            'queues': {
                'north': int(denorm_state[0]),
                'south': int(denorm_state[1]),
                'east': int(denorm_state[2]),
                'west': int(denorm_state[3])
            },
            'waiting_times': {
                'north': float(denorm_state[4]),
                'south': float(denorm_state[5]),
                'east': float(denorm_state[6]),
                'west': float(denorm_state[7])
            },
            'signal': {
                'phase': 'North-South' if int(denorm_state[8]) == 0 else 'East-West',
                'time_in_phase': float(denorm_state[9])
            },
            'total_queue': int(sum(denorm_state[0:4])),
            'avg_wait_time': float(np.mean(denorm_state[4:8])),
            'congestion_score': self.get_congestion_score(state)
        }
    
    def reset(self):
        """Reset state history"""
        self.state_history = []
        print("✅ State generator history reset")

# Singleton pattern
_state_generator = None

def get_state_generator(normalize: bool = True) -> StateGenerator:
    """
    Get or create singleton state generator instance
    
    Args:
        normalize: Whether to normalize states
    
    Returns:
        StateGenerator instance
    """
    global _state_generator
    if _state_generator is None:
        _state_generator = StateGenerator(normalize=normalize)
    return _state_generator