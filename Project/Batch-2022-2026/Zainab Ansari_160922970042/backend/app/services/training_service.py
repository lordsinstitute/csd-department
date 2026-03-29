import asyncio
import threading
from typing import Optional
from ..models.dqn_agent import DQNAgent
from ..sumo.environment import SumoEnvironment
from ..config import settings
import time

class TrainingService:
    """Service to manage DQN training"""
    
    def __init__(self):
        self.agent: Optional[DQNAgent] = None
        self.env: Optional[SumoEnvironment] = None
        self.training = False
        self.training_thread: Optional[threading.Thread] = None
        self.metrics_callback = None
        
        # Training stats
        self.current_episode = 0
        self.total_episodes = 0
        self.episode_rewards = []
        self.episode_losses = []
        
    def start_training(self, num_episodes: int = 100, gui: bool = False):
        """Start training in background thread"""
        if self.training:
            return {"status": "error", "message": "Training already running"}
        
        self.total_episodes = num_episodes
        self.training = True
        
        self.training_thread = threading.Thread(
            target=self._training_loop,
            args=(num_episodes, gui)
        )
        self.training_thread.start()
        
        return {"status": "started", "episodes": num_episodes}
    
    def _training_loop(self, num_episodes: int, gui: bool):
        """Main training loop"""
        print(f"\n🚀 Starting DQN training for {num_episodes} episodes...\n")
        
        # Initialize agent and environment
        self.agent = DQNAgent()
        self.env = SumoEnvironment(gui=gui)
        
        for episode in range(num_episodes):
            if not self.training:
                break
            
            self.current_episode = episode + 1
            state = self.env.reset()
            episode_reward = 0
            episode_loss = 0
            steps = 0
            
            while True:
                # Select action
                action = self.agent.select_action(state, training=True)
                
                # Execute action
                next_state, reward, done, info = self.env.step(action)
                
                # Store experience
                self.agent.store_experience(state, action, reward, next_state, done)
                
                # Train
                loss = self.agent.train_step()
                
                episode_reward += reward
                episode_loss += loss
                steps += 1
                state = next_state
                
                # Send metrics via callback
                if self.metrics_callback and steps % 10 == 0:
                    asyncio.run(self.metrics_callback({
                        'type': 'step',
                        'episode': episode + 1,
                        'step': steps,
                        'reward': reward,
                        'loss': loss,
                        'epsilon': self.agent.epsilon,
                        **info
                    }))
                
                if done:
                    break
            
            # Episode complete
            self.agent.episode = episode + 1
            self.agent.rewards.append(episode_reward)
            self.episode_rewards.append(episode_reward)
            self.episode_losses.append(episode_loss / steps if steps > 0 else 0)
            
            print(f"Episode {episode + 1}/{num_episodes} - "
                  f"Reward: {episode_reward:.2f}, "
                  f"Avg Loss: {episode_loss/steps:.4f}, "
                  f"Epsilon: {self.agent.epsilon:.3f}, "
                  f"Steps: {steps}")
            
            # Save model periodically
            if (episode + 1) % 10 == 0:
                self.agent.save_model(settings.MODEL_SAVE_PATH)
                print(f"✓ Model saved at episode {episode + 1}")
            
            # Send episode complete
            if self.metrics_callback:
                asyncio.run(self.metrics_callback({
                    'type': 'episode_complete',
                    'episode': episode + 1,
                    'total_reward': episode_reward,
                    'avg_loss': episode_loss / steps,
                    'epsilon': self.agent.epsilon,
                    'steps': steps
                }))
        
        # Training complete
        self.env.close()
        self.agent.save_model(settings.MODEL_SAVE_PATH)
        self.training = False
        
        print(f"\n✓ Training complete! Model saved to {settings.MODEL_SAVE_PATH}\n")
    
    def stop_training(self):
        """Stop training"""
        self.training = False
        if self.env:
            self.env.close()
        return {"status": "stopped"}
    
    def get_stats(self) -> dict:
        """Get current training stats"""
        stats = {
            'training': self.training,
            'current_episode': self.current_episode,
            'total_episodes': self.total_episodes,
            'recent_rewards': self.episode_rewards[-10:] if self.episode_rewards else [],
            'recent_losses': self.episode_losses[-10:] if self.episode_losses else []
        }
        
        if self.agent:
            stats.update(self.agent.get_stats())
        
        return stats