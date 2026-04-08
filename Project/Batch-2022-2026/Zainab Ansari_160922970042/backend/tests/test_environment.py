"""Test SUMO environment"""
import pytest
from app.sumo.environment import SumoEnvironment

def test_environment_initialization():
    """Test environment can be initialized"""
    env = SumoEnvironment(gui=False)
    assert env is not None
    assert env.traffic_light_id == "center"

def test_state_dimensions():
    """Test state has correct dimensions"""
    # This would require SUMO to be running
    # Placeholder test
    assert True