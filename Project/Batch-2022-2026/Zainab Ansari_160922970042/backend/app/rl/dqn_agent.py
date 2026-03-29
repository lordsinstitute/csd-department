# backend/app/rl/dqn_agent.py

"""
Enhanced DQN Agent for Traffic Control
Now accepts REAL vehicle counts from YOLOv8 detection
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import random
from typing import List, Tuple, Dict

class DQNNetwork(nn.Module):
    """
    Deep Q-Network Architecture
    
    Input: State vector (10 elements)
        [north_queue, south_queue, east_queue, west_queue,
         north_wait, south_wait, east_wait, west_wait,
         current_phase, time_in_phase]
    
    Output: Q-values for 2 actions
        [keep_signal, switch_signal]
    """
    
    def __init__(self, state_size: int = 10, action_size: int = 2):
        super(DQNNetwork, self).__init__()
        
        self.network = nn.Sequential(
            nn.Linear(state_size, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.2),
            
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.2),
            
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            
            nn.Linear(64, action_size)
        )
    
    def forward(self, x):
        return self.network(x)

class ReplayBuffer:
    """Experience replay buffer for DQN training"""
    
    def __init__(self, capacity: int = 10000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        """Add experience to buffer"""
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size: int) -> List:
        """Sample random batch"""
        return random.sample(self.buffer, batch_size)
    
    def __len__(self):
        return len(self.buffer)

class EnhancedDQNAgent:
    """
    Enhanced DQN Agent with real vehicle detection support
    
    Features:
    - Accepts real-time vehicle counts from YOLOv8
    - Normalizes state for better learning
    - Prioritizes emergency vehicles
    - Adaptive learning based on traffic patterns
    """
    
    def __init__(
        self,
        state_size: int = 10,
        action_size: int = 2,
        learning_rate: float = 0.001,
        gamma: float = 0.99,
        epsilon_start: float = 1.0,
        epsilon_end: float = 0.01,
        epsilon_decay: float = 0.995,
        batch_size: int = 64,
        memory_size: int = 10000
    ):
        """Initialize DQN agent"""
        
        self.state_size = state_size
        self.action_size = action_size
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size
        
        # Device
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Networks
        self.policy_net = DQNNetwork(state_size, action_size).to(self.device)
        self.target_net = DQNNetwork(state_size, action_size).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()
        
        # Optimizer
        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=learning_rate)
        self.loss_fn = nn.MSELoss()
        
        # Memory
        self.memory = ReplayBuffer(memory_size)
        
        # Training stats
        self.total_steps = 0
        self.episode = 0
        self.losses = []
        
        print(f"✅ Enhanced DQN Agent initialized")
        print(f"   State size: {state_size}")
        print(f"   Action size: {action_size}")
        print(f"   Device: {self.device}")
    
    def normalize_state(self, state: np.ndarray) -> np.ndarray:
        """
        Normalize state for better learning
        
        Args:
            state: Raw state [queues (4), waits (4), phase (1), time (1)]
        
        Returns:
            Normalized state in [0, 1] range
        """
        normalized = state.copy()
        
        # Normalize queue lengths (assuming max 20 vehicles per lane)
        normalized[0:4] = np.clip(state[0:4] / 20.0, 0, 1)
        
        # Normalize waiting times (assuming max 120 seconds)
        normalized[4:8] = np.clip(state[4:8] / 120.0, 0, 1)
        
        # Phase is already 0 or 1
        normalized[8] = state[8]
        
        # Normalize time in phase (assuming max 60 seconds)
        normalized[9] = np.clip(state[9] / 60.0, 0, 1)
        
        return normalized
    
    def state_from_vehicle_counts(
        self,
        lane_counts: Dict[str, int],
        current_phase: int,
        time_in_phase: float
    ) -> np.ndarray:
        """
        Create DQN state from YOLO vehicle counts
        
        Args:
            lane_counts: {'north': 5, 'south': 3, 'east': 7, 'west': 2}
            current_phase: 0 (NS green) or 1 (EW green)
            time_in_phase: Time in current phase (seconds)
        
        Returns:
            State vector ready for DQN
        """
        # Estimate waiting times (heuristic: 4 seconds per vehicle)
        north_wait = lane_counts['north'] * 4.0
        south_wait = lane_counts['south'] * 4.0
        east_wait = lane_counts['east'] * 4.0
        west_wait = lane_counts['west'] * 4.0
        
        state = np.array([
            lane_counts['north'],
            lane_counts['south'],
            lane_counts['east'],
            lane_counts['west'],
            north_wait,
            south_wait,
            east_wait,
            west_wait,
            current_phase,
            time_in_phase
        ], dtype=np.float32)
        
        return self.normalize_state(state)
    
    def select_action(self, state: np.ndarray, training: bool = True) -> int:
        """
        Select action using epsilon-greedy policy
        
        Args:
            state: Current state
            training: If True, use epsilon-greedy; if False, use greedy
        
        Returns:
            Action: 0 (keep) or 1 (switch)
        """
        if training and random.random() < self.epsilon:
            return random.randrange(self.action_size)
        
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.policy_net(state_tensor)
            return q_values.argmax().item()
    
    def select_action_with_emergency(
        self,
        state: np.ndarray,
        emergency_lane: str = None,
        training: bool = True
    ) -> int:
        """
        Select action with emergency vehicle priority
        
        Args:
            state: Current state
            emergency_lane: Lane with emergency vehicle ('north', 'south', 'east', 'west')
            training: Training mode flag
        
        Returns:
            Action (0 or 1)
        """
        current_phase = int(state[8] * 1)  # Denormalize
        
        # If emergency vehicle detected, override signal
        if emergency_lane:
            # Emergency in North/South → set NS green (phase 0)
            if emergency_lane in ['north', 'south']:
                return 0 if current_phase == 1 else 1  # Switch to NS if currently EW
            # Emergency in East/West → set EW green (phase 1)
            else:
                return 1 if current_phase == 0 else 0  # Switch to EW if currently NS
        
        # Normal DQN action
        return self.select_action(state, training)
    
    def calculate_reward(
        self,
        prev_state: np.ndarray,
        action: int,
        next_state: np.ndarray
    ) -> float:
        """
        Calculate reward based on traffic improvement
        
        Reward components:
        - Reduced waiting time (positive)
        - Reduced queue length (positive)
        - Unnecessary switches (negative)
        
        Args:
            prev_state: State before action
            action: Action taken
            next_state: State after action
        
        Returns:
            Reward value
        """
        # Denormalize states
        prev_wait = prev_state[4:8] * 120.0
        next_wait = next_state[4:8] * 120.0
        
        prev_queue = prev_state[0:4] * 20.0
        next_queue = next_state[0:4] * 20.0
        
        # Calculate changes
        wait_reduction = np.sum(prev_wait) - np.sum(next_wait)
        queue_reduction = np.sum(prev_queue) - np.sum(next_queue)
        
        # Reward components
        reward = 0.0
        
        # Reward for reducing waiting time
        reward += wait_reduction * 0.5
        
        # Reward for reducing queue length
        reward += queue_reduction * 1.0
        
        # Penalty for switching signals (to avoid excessive switching)
        if action == 1:  # Switch action
            reward -= 5.0
        
        # Bonus for serving longer queues
        if action == 1:
            current_phase = int(prev_state[8])
            if current_phase == 0:  # Was NS, switching to EW
                ew_queue = prev_queue[2] + prev_queue[3]
                if ew_queue > 10:
                    reward += 3.0
            else:  # Was EW, switching to NS
                ns_queue = prev_queue[0] + prev_queue[1]
                if ns_queue > 10:
                    reward += 3.0
        
        return reward
    
    def store_experience(
        self,
        state: np.ndarray,
        action: int,
        reward: float,
        next_state: np.ndarray,
        done: bool
    ):
        """Store experience in replay buffer"""
        self.memory.push(state, action, reward, next_state, done)
    
    def train_step(self) -> float:
        """
        Perform one training step
        
        Returns:
            Loss value
        """
        if len(self.memory) < self.batch_size:
            return 0.0
        
        # Sample batch
        batch = self.memory.sample(self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        
        # Convert to tensors
        states = torch.FloatTensor(np.array(states)).to(self.device)
        actions = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        rewards = torch.FloatTensor(rewards).unsqueeze(1).to(self.device)
        next_states = torch.FloatTensor(np.array(next_states)).to(self.device)
        dones = torch.FloatTensor(dones).unsqueeze(1).to(self.device)
        
        # Current Q values
        current_q = self.policy_net(states).gather(1, actions)
        
        # Target Q values
        with torch.no_grad():
            next_q = self.target_net(next_states).max(1)[0].unsqueeze(1)
            target_q = rewards + (1 - dones) * self.gamma * next_q
        
        # Compute loss
        loss = self.loss_fn(current_q, target_q)
        
        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.policy_net.parameters(), 1.0)
        self.optimizer.step()
        
        # Decay epsilon
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)
        
        # Update stats
        self.total_steps += 1
        self.losses.append(loss.item())
        
        return loss.item()
    
    def update_target_network(self):
        """Update target network with policy network weights"""
        self.target_net.load_state_dict(self.policy_net.state_dict())
    
    def save(self, filepath: str):
        """Save model checkpoint"""
        torch.save({
            'policy_net': self.policy_net.state_dict(),
            'target_net': self.target_net.state_dict(),
            'optimizer': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
            'total_steps': self.total_steps,
            'episode': self.episode
        }, filepath)
        print(f"✅ Model saved: {filepath}")
    
    def load(self, filepath: str):
        """Load model checkpoint"""
        checkpoint = torch.load(filepath, map_location=self.device)
        self.policy_net.load_state_dict(checkpoint['policy_net'])
        self.target_net.load_state_dict(checkpoint['target_net'])
        self.optimizer.load_state_dict(checkpoint['optimizer'])
        self.epsilon = checkpoint['epsilon']
        self.total_steps = checkpoint['total_steps']
        self.episode = checkpoint['episode']
        print(f"✅ Model loaded: {filepath}")