import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Tuple
from .network import DQNetwork
from .replay_buffer import ReplayBuffer
from ..config import settings

class DQNAgent:
    """Deep Q-Network Agent for Traffic Signal Control"""
    
    def __init__(self):
        self.state_size = settings.STATE_SIZE
        self.action_size = settings.ACTION_SIZE
        self.gamma = settings.GAMMA
        self.epsilon = settings.EPSILON_START
        self.epsilon_min = settings.EPSILON_MIN
        self.epsilon_decay = settings.EPSILON_DECAY
        self.learning_rate = settings.LEARNING_RATE
        self.batch_size = settings.BATCH_SIZE
        self.target_update = settings.TARGET_UPDATE
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Networks
        self.policy_net = DQNetwork(self.state_size, self.action_size).to(self.device)
        self.target_net = DQNetwork(self.state_size, self.action_size).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()
        
        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=self.learning_rate)
        self.criterion = nn.MSELoss()
        
        # Replay buffer
        self.memory = ReplayBuffer(settings.MEMORY_SIZE)
        
        # Tracking
        self.steps = 0
        self.episode = 0
        self.losses = []
        self.rewards = []
        
    def select_action(self, state: np.ndarray, training: bool = True) -> int:
        """Select action using epsilon-greedy policy"""
        if training and np.random.random() < self.epsilon:
            return np.random.randint(self.action_size)
        
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.policy_net(state_tensor)
            return q_values.argmax().item()
    
    def store_experience(self, state, action, reward, next_state, done):
        """Store experience in replay buffer"""
        self.memory.push(state, action, reward, next_state, done)
    
    def train_step(self) -> float:
        """Perform one training step"""
        if len(self.memory) < self.batch_size:
            return 0.0
        
        # Sample batch
        states, actions, rewards, next_states, dones = self.memory.sample(self.batch_size)
        
        # Convert to tensors
        states = torch.FloatTensor(states).to(self.device)
        actions = torch.LongTensor(actions).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        dones = torch.FloatTensor(dones).to(self.device)
        
        # Current Q values
        current_q = self.policy_net(states).gather(1, actions.unsqueeze(1))
        
        # Next Q values from target network
        with torch.no_grad():
            next_q = self.target_net(next_states).max(1)[0]
            target_q = rewards + (1 - dones) * self.gamma * next_q
        
        # Compute loss
        loss = self.criterion(current_q.squeeze(), target_q)
        
        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.policy_net.parameters(), 1.0)
        self.optimizer.step()
        
        # Update target network
        self.steps += 1
        if self.steps % self.target_update == 0:
            self.target_net.load_state_dict(self.policy_net.state_dict())
        
        # Decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
        
        self.losses.append(loss.item())
        return loss.item()
    
    def save_model(self, path: str):
        """Save model weights"""
        torch.save({
            'policy_net': self.policy_net.state_dict(),
            'target_net': self.target_net.state_dict(),
            'optimizer': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
            'episode': self.episode,
            'steps': self.steps
        }, path)
        
    def load_model(self, path: str):
        """Load model weights"""
        checkpoint = torch.load(path, map_location=self.device)
        self.policy_net.load_state_dict(checkpoint['policy_net'])
        self.target_net.load_state_dict(checkpoint['target_net'])
        self.optimizer.load_state_dict(checkpoint['optimizer'])
        self.epsilon = checkpoint['epsilon']
        self.episode = checkpoint.get('episode', 0)
        self.steps = checkpoint.get('steps', 0)
        
    def get_stats(self) -> dict:
        """Get training statistics"""
        return {
            'episode': self.episode,
            'epsilon': self.epsilon,
            'learning_rate': self.learning_rate,
            'gamma': self.gamma,
            'batch_size': self.batch_size,
            'memory_size': len(self.memory),
            'total_steps': self.steps,
            'avg_loss': np.mean(self.losses[-100:]) if self.losses else 0.0,
            'avg_reward': np.mean(self.rewards[-100:]) if self.rewards else 0.0
        }