"""Test DQN agent"""
import pytest
import numpy as np
from app.models.dqn_agent import DQNAgent

def test_agent_initialization():
    """Test agent initialization"""
    agent = DQNAgent()
    assert agent.state_size == 20
    assert agent.action_size == 2
    assert agent.epsilon == 1.0

def test_action_selection():
    """Test action selection"""
    agent = DQNAgent()
    state = np.random.random(20)
    action = agent.select_action(state, training=False)
    assert action in [0, 1]

def test_memory_storage():
    """Test experience storage"""
    agent = DQNAgent()
    state = np.random.random(20)
    action = 0
    reward = -10.0
    next_state = np.random.random(20)
    done = False
    
    agent.store_experience(state, action, reward, next_state, done)
    assert len(agent.memory) == 1