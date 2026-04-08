import cv2
import numpy as np
import base64
from pathlib import Path
from typing import Dict, Optional, List

from ..services.video_detector import get_video_detector
from ..config.video_config import VideoConfig


class VideoProcessor:

    def __init__(self, video_path: str):

        self.video_path = Path(video_path)

        if not self.video_path.exists():
            raise FileNotFoundError(f"Video not found: {video_path}")

        self.cap = cv2.VideoCapture(str(self.video_path))

        if not self.cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))

        if self.fps == 0 or self.fps > 120:
            self.fps = VideoConfig.DEFAULT_FPS

        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.duration = self.total_frames / self.fps if self.fps > 0 else 0

        self.detector = get_video_detector()

        self.current_frame = 0
        self.current_phase = 0
        self.time_in_phase = 0.0

        self.state_history: List[np.ndarray] = []

        print("✅ VideoProcessor initialized")

    def process_frame(self, frame) -> Dict:

        self.current_frame += 1

        try:

            # -------------------------
            # YOLO DETECTION
            # -------------------------
            detections = self.detector.detect_vehicles(frame)

            lane_counts = self.detector.count_by_lanes(detections, frame.shape)

            stats = self.detector.get_detection_statistics(detections)

            state_vector = self._generate_state_vector(lane_counts)

            # -------------------------
            # BASE64 FRAME ENCODING
            # -------------------------
            _, buffer = cv2.imencode(".jpg", frame)
            frame_base64 = base64.b64encode(buffer).decode("utf-8")

            return {
                "frame_number": self.current_frame,
                "timestamp": self.current_frame / self.fps,
                "frame": frame_base64,
                "detections": detections,
                "lane_counts": lane_counts,
                "total_vehicles": sum(lane_counts.values()),
                "statistics": stats,
                "state_vector": state_vector.tolist(),
                "heatmap": {
                    "cells": [],
                    "grid_size": 50,
                    "max_density": 0
                },
                "accident": None,
                "emergency_detected": False
            }

        except Exception as e:

            print("Frame processing error:", e)

            # fallback frame encoding
            _, buffer = cv2.imencode(".jpg", frame)
            frame_base64 = base64.b64encode(buffer).decode("utf-8")

            return {
                "frame_number": self.current_frame,
                "timestamp": self.current_frame / self.fps,
                "frame": frame_base64,
                "detections": [],
                "lane_counts": {
                    "north": 0,
                    "south": 0,
                    "east": 0,
                    "west": 0
                },
                "total_vehicles": 0,
                "statistics": {
                    "total_detections": 0,
                    "avg_confidence": 0,
                    "vehicle_types": {},
                    "active_tracks": 0
                },
                "heatmap": {
                    "cells": [],
                    "grid_size": 50,
                    "max_density": 0
                },
                "accident": None,
                "emergency_detected": False
            }

    def _generate_state_vector(self, lane_counts: Dict[str, int]) -> np.ndarray:

        north_wait = lane_counts["north"] * 4.0
        south_wait = lane_counts["south"] * 4.0
        east_wait = lane_counts["east"] * 4.0
        west_wait = lane_counts["west"] * 4.0

        state = np.array([
            lane_counts["north"],
            lane_counts["south"],
            lane_counts["east"],
            lane_counts["west"],
            north_wait,
            south_wait,
            east_wait,
            west_wait,
            self.current_phase,
            self.time_in_phase
        ], dtype=np.float32)

        return state

    def reset(self):

        self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

        self.current_frame = 0
        self.current_phase = 0
        self.time_in_phase = 0

        print("✅ Video reset")

    def release(self):

        if self.cap is not None:
            self.cap.release()