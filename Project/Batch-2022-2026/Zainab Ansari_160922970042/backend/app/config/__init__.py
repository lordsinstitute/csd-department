# backend/app/config/__init__.py

"""
Configuration Package
Contains all application settings and video processing config
"""

from .video_config import VideoConfig

# ==================== MAIN APPLICATION SETTINGS ====================

class Settings:
    """Main application settings for NexusFlow"""
    
    # ========== Application Info ==========
    VERSION = "2.0.0"
    HOST = "0.0.0.0"
    PORT = 8000
    DEBUG = True
    
    # ========== CORS Settings ==========
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # ========== DQN Agent Settings ==========
    # These are used by your DQN agent and routes
    LEARNING_RATE = 0.001
    GAMMA = 0.99
    EPSILON_START = 1.0
    EPSILON_END = 0.01
    EPSILON_DECAY = 0.995
    BATCH_SIZE = 64
    MEMORY_SIZE = 10000
    TARGET_UPDATE = 10
    
    # ========== SUMO Environment Settings ==========
    # Traffic signal timing
    GREEN_MIN = 10  # Minimum green light duration (seconds)
    GREEN_MAX = 60  # Maximum green light duration (seconds)
    YELLOW_DURATION = 3  # Yellow light duration (seconds)
    
    # Simulation settings
    STEP_LENGTH = 1.0  # SUMO simulation step length (seconds)
    MAX_STEPS = 3600  # Maximum steps per episode (1 hour)
    
    # ========== Traffic Generation ==========
    TRAFFIC_DENSITY = {
        'low': 100,
        'medium': 200,
        'high': 400,
        'rush_hour': 600
    }
    
    # ========== Reward Function ==========
    REWARD_SCALE = 0.1
    WAITING_PENALTY = -0.5
    THROUGHPUT_REWARD = 1.0
    
    # ========== File Paths ==========
    SUMO_CONFIG_DIR = "sumo_config"
    MODELS_DIR = "saved_models"
    LOGS_DIR = "logs"
    
    # ========== Database (if needed) ==========
    DATABASE_URL = "sqlite:///./nexusflow.db"
    
    # ========== API Settings ==========
    API_TITLE = "NexusFlow Traffic Control API"
    API_DESCRIPTION = "Adaptive Deep Reinforcement Learning Traffic Optimization System"
    API_VERSION = VERSION
    
    # ========== WebSocket Settings ==========
    WS_HEARTBEAT_INTERVAL = 30  # seconds
    WS_MAX_CONNECTIONS = 100

# Create settings instance
settings = Settings()

# Export both Settings class and instance
__all__ = ['VideoConfig', 'Settings', 'settings']