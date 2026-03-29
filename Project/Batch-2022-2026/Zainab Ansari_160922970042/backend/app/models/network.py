import torch
import torch.nn as nn
import torch.nn.functional as F

class DQNetwork(nn.Module):
    """Deep Q-Network with 3 hidden layers"""
    
    def __init__(self, state_size: int, action_size: int):
        super(DQNetwork, self).__init__()
        
        self.fc1 = nn.Linear(state_size, 128)
        self.bn1 = nn.BatchNorm1d(128)
        
        self.fc2 = nn.Linear(128, 128)
        self.bn2 = nn.BatchNorm1d(128)
        
        self.fc3 = nn.Linear(128, 64)
        self.bn3 = nn.BatchNorm1d(64)
        
        self.fc4 = nn.Linear(64, action_size)
        
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        x = F.relu(self.bn1(self.fc1(x)))
        x = self.dropout(x)
        
        x = F.relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)
        
        x = F.relu(self.bn3(self.fc3(x)))
        
        return self.fc4(x)