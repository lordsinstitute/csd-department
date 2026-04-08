"""
Video Processing Configuration
YOLOv8 settings, lane ROI configuration, and upload handling
"""

from pathlib import Path
import torch


class VideoConfig:
    """Video processing configuration"""

    # -----------------------------
    # YOLOv8 Model Configuration
    # -----------------------------

    MODEL_NAME = "yolov8n.pt"  # fastest YOLO model
    CONFIDENCE_THRESHOLD = 0.45
    IOU_THRESHOLD = 0.50
    INPUT_SIZE = 640
    MAX_DETECTIONS = 100

    # -----------------------------
    # Vehicle Classes (COCO)
    # -----------------------------

    VEHICLE_CLASSES = {
        2: "car",
        3: "motorcycle",
        5: "bus",
        7: "truck"
    }

    @classmethod
    def get_vehicle_classes(cls):
        return list(cls.VEHICLE_CLASSES.keys())

    # -----------------------------
    # Lane Regions of Interest
    # -----------------------------

    LANE_ROI = {

        "north": {
            "x1": 0.40,
            "y1": 0.00,
            "x2": 0.60,
            "y2": 0.35
        },

        "south": {
            "x1": 0.40,
            "y1": 0.65,
            "x2": 0.60,
            "y2": 1.00
        },

        "east": {
            "x1": 0.65,
            "y1": 0.40,
            "x2": 1.00,
            "y2": 0.60
        },

        "west": {
            "x1": 0.00,
            "y1": 0.40,
            "x2": 0.35,
            "y2": 0.60
        }

    }

    @classmethod
    def get_lane_names(cls):
        return list(cls.LANE_ROI.keys())

    # -----------------------------
    # Upload Directory Settings
    # -----------------------------

    BASE_DIR = Path(__file__).resolve().parent.parent.parent

    UPLOAD_DIR = BASE_DIR / "uploads" / "videos"

    ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}

    MAX_FILE_SIZE_MB = 500

    # Ensure upload folder exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    def get_upload_path(cls, filename: str) -> Path:
        return cls.UPLOAD_DIR / filename

    @classmethod
    def is_valid_extension(cls, filename: str) -> bool:
        return Path(filename).suffix.lower() in cls.ALLOWED_EXTENSIONS

    # -----------------------------
    # Video Processing
    # -----------------------------

    FRAME_SKIP = 2
    DEFAULT_FPS = 30

    # -----------------------------
    # Hardware Settings
    # -----------------------------

    USE_GPU = torch.cuda.is_available()

    DEVICE = "cuda" if USE_GPU else "cpu"

    # -----------------------------
    # Visualization
    # -----------------------------

    DRAW_BOUNDING_BOX = True
    DRAW_LANE_ROI = False

    # -----------------------------
    # Debug Settings
    # -----------------------------

    DEBUG = False


# -----------------------------
# Reinforcement Learning Config
# -----------------------------

STATE_VECTOR_SIZE = 10
ACTION_SPACE = 2

# -----------------------------
# Traffic Signal Timing
# -----------------------------

MIN_PHASE_TIME = 5
MAX_PHASE_TIME = 60
YELLOW_TIME = 3

# -----------------------------
# Performance Settings
# -----------------------------

PROCESS_EVERY_N_FRAMES = 2