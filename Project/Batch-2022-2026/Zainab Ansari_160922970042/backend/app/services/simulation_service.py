import asyncio
import threading
from typing import Optional
from ..models.dqn_agent import DQNAgent
from ..sumo.environment import SumoEnvironment
from ..sumo.traffic_generator import TrafficGenerator
from ..config import settings
import os

class SimulationService:
    """Service to manage live simulation"""
    
    def __init__(self):
        self.env: Optional[SumoEnvironment] = None
        self.agent: Optional[DQNAgent] = None
        self.running = False
        self.paused = False
        self.simulation_thread: Optional[threading.Thread] = None
        self.metrics_callback = None
        self.mode = "ai"  # ai or manual
        
        # Stats
        self.current_step = 0
        self.total_reward = 0
        
    def start_simulation(self, mode: str = "ai", gui: bool = False, 
                        traffic_density: str = "medium", 
                        n_vehicles: int = 1000):
        """Start live simulation"""
        if self.running:
            return {"status": "error", "message": "Simulation already running"}
        
        self.mode = mode
        self.running = True
        self.paused = False
        
        # Generate traffic
        route_file = "../sumo_config/routes.rou.xml"
        generator = TrafficGenerator(route_file)
        generator.generate_traffic(n_vehicles, traffic_density)
        
        self.simulation_thread = threading.Thread(
            target=self._simulation_loop,
            args=(gui,)
        )
        self.simulation_thread.start()
        
        return {"status": "started", "mode": mode}
    
    def _simulation_loop(self, gui: bool):
        """Main simulation loop"""
        print(f"\n🚦 Starting {self.mode.upper()} simulation...\n")
        
        # Initialize environment
        self.env = SumoEnvironment(gui=gui)
        
        # Load trained agent if AI mode
        if self.mode == "ai":
            self.agent = DQNAgent()
            if os.path.exists(settings.MODEL_SAVE_PATH):
                self.agent.load_model(settings.MODEL_SAVE_PATH)
                print("✓ Loaded trained model")
            else:
                print("⚠ No trained model found, using random actions")
        
        state = self.env.reset()
        self.current_step = 0
        self.total_reward = 0
        
        while self.running:
            if self.paused:
                asyncio.sleep(0.1)
                continue
            
            # Select action
            if self.mode == "ai" and self.agent:
                action = self.agent.select_action(state, training=False)
            else:
                # Manual (fixed-time) control
                action = 1 if self.current_step % 30 == 0 else 0
            
            # Execute action
            next_state, reward, done, info = self.env.step(action)
            
            self.total_reward += reward
            self.current_step += 1
            state = next_state
            
            # Send metrics
            if self.metrics_callback and self.current_step % 5 == 0:
                asyncio.run(self.metrics_callback({
                    'type': 'simulation_update',
                    'step': self.current_step,
                    'mode': self.mode,
                    'action': action,
                    'reward': reward,
                    'total_reward': self.total_reward,
                    **info
                }))
            
            if done:
                print(f"\n✓ Simulation complete - {self.current_step} steps\n")
                break
        
        self.env.close()
        self.running = False
        
    def pause_simulation(self):
        """Pause simulation"""
        self.paused = True
        return {"status": "paused"}
    
    def resume_simulation(self):
        """Resume simulation"""
        self.paused = False
        return {"status": "resumed"}
    
    def stop_simulation(self):
        """Stop simulation"""
        self.running = False
        if self.env:
            self.env.close()
        return {"status": "stopped"}
    
    def get_status(self) -> dict:
        """Get current simulation status"""
        return {
            'running': self.running,
            'paused': self.paused,
            'mode': self.mode,
            'current_step': self.current_step,
            'total_reward': self.total_reward
        }