"""
RL Training Manager
Manages DQN training sessions with live metrics streaming
"""

import asyncio
from typing import Dict, Optional, List
from datetime import datetime
import numpy as np

class TrainingManager:
    def __init__(self, dqn_agent):
        """
        Initialize training manager
        
        Args:
            dqn_agent: DQN agent instance
        """
        self.agent = dqn_agent
        self.is_training = False
        self.is_paused = False
        
        # Training state
        self.current_episode = 0
        self.total_episodes = 0
        self.training_start_time = None
        
        # Metrics history
        self.episode_rewards = []
        self.episode_losses = []
        self.epsilon_history = []
        self.avg_wait_times = []
        
        # Real-time metrics
        self.current_metrics = {
            'episode': 0,
            'reward': 0,
            'loss': 0,
            'epsilon': 1.0,
            'avg_wait_time': 0,
            'replay_memory_size': 0,
            'training_time': 0
        }
        
    async def start_training(self, num_episodes: int, websocket_manager=None):
        """
        Start training loop
        
        Args:
            num_episodes: Number of episodes to train
            websocket_manager: WebSocket manager for streaming updates
        """
        if self.is_training:
            return {"status": "error", "message": "Training already in progress"}
        
        self.is_training = True
        self.is_paused = False
        self.total_episodes = num_episodes
        self.current_episode = 0
        self.training_start_time = datetime.now()
        
        print(f"🎯 Starting training for {num_episodes} episodes...")
        
        for episode in range(num_episodes):
            if not self.is_training:
                break
            
            # Wait if paused
            while self.is_paused and self.is_training:
                await asyncio.sleep(0.1)
            
            if not self.is_training:
                break
            
            # Run episode
            episode_reward, episode_loss, avg_wait = await self._run_episode(episode)
            
            # Update metrics
            self.current_episode = episode + 1
            self.episode_rewards.append(episode_reward)
            self.episode_losses.append(episode_loss)
            self.epsilon_history.append(self.agent.epsilon)
            self.avg_wait_times.append(avg_wait)
            
            # Update current metrics
            self.current_metrics = {
                'episode': episode + 1,
                'reward': float(episode_reward),
                'loss': float(episode_loss),
                'epsilon': float(self.agent.epsilon),
                'avg_wait_time': float(avg_wait),
                'replay_memory_size': len(self.agent.memory) if hasattr(self.agent, 'memory') else 0,
                'training_time': (datetime.now() - self.training_start_time).total_seconds()
            }
            
            # Stream update via WebSocket
            if websocket_manager:
                await websocket_manager.broadcast({
                    'type': 'training_update',
                    'data': self.current_metrics
                })
            
            # Print progress
            if (episode + 1) % 10 == 0:
                print(f"Episode {episode + 1}/{num_episodes} | "
                      f"Reward: {episode_reward:.2f} | "
                      f"Loss: {episode_loss:.4f} | "
                      f"Epsilon: {self.agent.epsilon:.3f}")
        
        self.is_training = False
        print("✅ Training completed!")
        
        return {
            "status": "success",
            "message": f"Training completed: {num_episodes} episodes",
            "metrics": self.current_metrics
        }
    
    async def _run_episode(self, episode: int) -> tuple:
        """
        Run single training episode
        
        Returns:
            (episode_reward, episode_loss, avg_wait_time)
        """
        # Simulate environment interaction
        state_size = self.agent.state_size
        action_size = self.agent.action_size
        
        total_reward = 0
        total_loss = 0
        step_count = 0
        wait_times = []
        
        # Initialize state
        state = np.random.random(state_size)
        
        # Episode loop (max 100 steps)
        for step in range(100):
            # Agent selects action
            action = self.agent.act(state)
            
            # Simulate environment step
            next_state = np.random.random(state_size)
            
            # Calculate reward (negative wait time)
            wait_time = np.random.uniform(10, 50)
            reward = -wait_time / 10.0  # Normalize
            
            # Check if done
            done = step >= 99
            
            # Store experience
            self.agent.remember(state, action, reward, next_state, done)
            
            # Train agent
            if len(self.agent.memory) > 32:
                loss = self.agent.replay(batch_size=32)
                total_loss += loss
            
            # Update state
            state = next_state
            total_reward += reward
            wait_times.append(wait_time)
            step_count += 1
            
            # Small delay to prevent CPU overload
            await asyncio.sleep(0.01)
            
            if done:
                break
        
        # Calculate averages
        avg_loss = total_loss / step_count if step_count > 0 else 0
        avg_wait = np.mean(wait_times) if wait_times else 0
        
        # Decay epsilon
        if hasattr(self.agent, 'epsilon_decay'):
            self.agent.epsilon = max(
                self.agent.epsilon_min,
                self.agent.epsilon * self.agent.epsilon_decay
            )
        
        return total_reward, avg_loss, avg_wait
    
    def pause_training(self):
        """Pause current training"""
        if self.is_training and not self.is_paused:
            self.is_paused = True
            return {"status": "success", "message": "Training paused"}
        return {"status": "error", "message": "No active training to pause"}
    
    def resume_training(self):
        """Resume paused training"""
        if self.is_training and self.is_paused:
            self.is_paused = False
            return {"status": "success", "message": "Training resumed"}
        return {"status": "error", "message": "Training not paused"}
    
    def stop_training(self):
        """Stop current training"""
        if self.is_training:
            self.is_training = False
            self.is_paused = False
            return {"status": "success", "message": "Training stopped"}
        return {"status": "error", "message": "No active training"}
    
    def get_metrics(self) -> Dict:
        """Get current training metrics"""
        return {
            'current': self.current_metrics,
            'history': {
                'episodes': list(range(1, len(self.episode_rewards) + 1)),
                'rewards': [float(r) for r in self.episode_rewards],
                'losses': [float(l) for l in self.episode_losses],
                'epsilon': [float(e) for e in self.epsilon_history],
                'wait_times': [float(w) for w in self.avg_wait_times]
            },
            'status': {
                'is_training': self.is_training,
                'is_paused': self.is_paused,
                'progress': (self.current_episode / self.total_episodes * 100) if self.total_episodes > 0 else 0
            }
        }