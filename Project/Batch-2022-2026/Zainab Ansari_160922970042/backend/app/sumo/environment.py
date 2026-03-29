import traci
import numpy as np
from typing import Tuple, Dict
from ..config import settings

class SumoEnvironment:
    """SUMO Traffic Environment"""
    
    def __init__(self, gui: bool = False):
        self.gui = gui
        self.sumo_cmd = None
        self.traffic_light_id = "center"
        
        # Phases
        self.green_duration = settings.GREEN_MIN
        self.yellow_duration = settings.YELLOW_TIME
        self.current_phase = 0
        self.phase_time = 0
        
        # Lanes
        self.lanes = []
        self.incoming_lanes = []
        
        # Metrics
        self.total_waiting_time = 0
        self.total_queue_length = 0
        self.total_vehicles_passed = 0
        self.step_count = 0
        
    def start(self):
        """Start SUMO simulation"""
        sumo_binary = "sumo-gui" if self.gui else "sumo"
        
        self.sumo_cmd = [
            sumo_binary,
            "-c", settings.SUMO_CONFIG,
            "--step-length", str(settings.SUMO_STEP_LENGTH),
            "--no-warnings",
            "--no-step-log",
            "--time-to-teleport", "-1",
            "--waiting-time-memory", "1000"
        ]
        
        traci.start(self.sumo_cmd)
        
        # Get controlled lanes
        self.lanes = list(set(traci.trafficlight.getControlledLanes(self.traffic_light_id)))
        self.incoming_lanes = [lane for lane in self.lanes if lane.endswith('_0')]
        
        print(f"✓ SUMO started. Monitoring {len(self.incoming_lanes)} incoming lanes")
        
    def reset(self) -> np.ndarray:
        """Reset environment"""
        if traci.isLoaded():
            traci.close()
            
        self.start()
        
        self.current_phase = 0
        self.phase_time = 0
        self.total_waiting_time = 0
        self.total_queue_length = 0
        self.total_vehicles_passed = 0
        self.step_count = 0
        
        # Set initial phase
        traci.trafficlight.setPhase(self.traffic_light_id, 0)
        
        return self._get_state()
    
    def _get_state(self) -> np.ndarray:
        """Get current state from SUMO"""
        state = []
        
        # For each incoming lane
        for lane in self.incoming_lanes:
            # Queue length (halting vehicles)
            queue = traci.lane.getLastStepHaltingNumber(lane)
            state.append(queue / 10.0)  # Normalize
            
            # Waiting time
            wait_time = traci.lane.getWaitingTime(lane)
            state.append(wait_time / 100.0)  # Normalize
            
            # Occupancy
            occupancy = traci.lane.getLastStepOccupancy(lane)
            state.append(occupancy)
            
            # Vehicle count
            vehicles = traci.lane.getLastStepVehicleNumber(lane)
            state.append(vehicles / 5.0)  # Normalize
        
        # Current phase (one-hot encoded)
        phase_encoding = [0, 0]
        phase_encoding[self.current_phase] = 1
        state.extend(phase_encoding)
        
        # Time in current phase (normalized)
        state.append(self.phase_time / settings.GREEN_MAX)
        
        # Pad to state_size if needed
        while len(state) < settings.STATE_SIZE:
            state.append(0.0)
        
        return np.array(state[:settings.STATE_SIZE], dtype=np.float32)
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict]:
        """Execute action and return new state"""
        
        # Action 0: Keep current phase
        # Action 1: Switch phase
        
        if action == 1 and self.phase_time >= settings.GREEN_MIN:
            # Switch to yellow
            yellow_phase = self.current_phase * 2 + 1
            traci.trafficlight.setPhase(self.traffic_light_id, yellow_phase)
            
            # Wait yellow duration
            for _ in range(self.yellow_duration):
                traci.simulationStep()
                self.step_count += 1
            
            # Switch to next green phase
            self.current_phase = 1 - self.current_phase
            green_phase = self.current_phase * 2
            traci.trafficlight.setPhase(self.traffic_light_id, green_phase)
            self.phase_time = 0
        
        # Execute one simulation step
        traci.simulationStep()
        self.step_count += 1
        self.phase_time += 1
        
        # Get metrics
        metrics = self._get_metrics()
        
        # Calculate reward
        reward = self._calculate_reward(metrics)
        
        # Check if done
        done = (self.step_count >= settings.MAX_STEPS or 
                traci.simulation.getMinExpectedNumber() <= 0)
        
        # Get new state
        next_state = self._get_state()
        
        return next_state, reward, done, metrics
    
    def _get_metrics(self) -> Dict:
        """Get current traffic metrics"""
        total_waiting = 0
        total_queue = 0
        total_vehicles = 0
        total_speed = 0
        
        for lane in self.incoming_lanes:
            waiting = traci.lane.getWaitingTime(lane)
            queue = traci.lane.getLastStepHaltingNumber(lane)
            vehicles = traci.lane.getLastStepVehicleNumber(lane)
            
            total_waiting += waiting
            total_queue += queue
            total_vehicles += vehicles
            
            if vehicles > 0:
                speed = traci.lane.getLastStepMeanSpeed(lane)
                total_speed += speed * vehicles
        
        avg_speed = total_speed / total_vehicles if total_vehicles > 0 else 0
        avg_waiting = total_waiting / total_vehicles if total_vehicles > 0 else 0
        
        # Update cumulative metrics
        self.total_waiting_time += total_waiting
        self.total_queue_length += total_queue
        
        return {
            'avg_waiting_time': avg_waiting,
            'total_waiting_time': total_waiting,
            'queue_length': total_queue,
            'vehicle_count': total_vehicles,
            'avg_speed': avg_speed,
            'current_phase': self.current_phase,
            'phase_duration': self.phase_time,
            'throughput': self.total_vehicles_passed,
            'step': self.step_count
        }
    
    def _calculate_reward(self, metrics: Dict) -> float:
        """
        Calculate reward based on traffic metrics
        Reward = -(waiting_time + queue_penalty)
        """
        waiting_penalty = metrics['total_waiting_time'] / 100.0
        queue_penalty = metrics['queue_length'] * 2.0
        
        # Penalty for too frequent phase changes
        change_penalty = 0
        if self.phase_time < 5:
            change_penalty = 10
        
        reward = -(waiting_penalty + queue_penalty + change_penalty)
        
        return reward
    
    def close(self):
        """Close SUMO"""
        if traci.isLoaded():
            traci.close()
    
    def get_dimensions(self) -> Tuple[int, int]:
        """Get state and action dimensions"""
        return settings.STATE_SIZE, settings.ACTION_SIZE