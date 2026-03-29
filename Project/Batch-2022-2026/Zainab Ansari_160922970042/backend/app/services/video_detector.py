"""
YOLOv8 Vehicle Detection Service
Detects vehicles in traffic videos and provides lane-based counting
"""

import cv2
import numpy as np
from ultralytics import YOLO
import torch
from typing import List, Dict, Tuple

from ..config.video_config import VideoConfig


class VideoVehicleDetector:

    def __init__(self):

        print("🎥 Initializing YOLOv8 Vehicle Detector...")

        try:

            self.model = YOLO(VideoConfig.MODEL_NAME)

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model.to(self.device)

            print("✅ YOLOv8 Loaded")
            print(f"✅ Device: {self.device}")
            print(f"✅ Model: {VideoConfig.MODEL_NAME}")

        except Exception as e:
            print("❌ Failed to load YOLO model:", e)
            raise RuntimeError(e)

    # =====================================================
    # VEHICLE DETECTION
    # =====================================================

    def detect_vehicles(self, frame: np.ndarray) -> List[Dict]:

        try:

            results = self.model(
                frame,
                conf=VideoConfig.CONFIDENCE_THRESHOLD,
                iou=VideoConfig.IOU_THRESHOLD,
                max_det=VideoConfig.MAX_DETECTIONS,
                verbose=False
            )[0]

            detections = []

            track_id = 0

            for box in results.boxes:

                class_id = int(box.cls[0])

                if class_id in VideoConfig.VEHICLE_CLASSES:

                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0])

                    cx = int((x1 + x2) / 2)
                    cy = int((y1 + y2) / 2)

                    detections.append({
                        "id": track_id,
                        "class": VideoConfig.VEHICLE_CLASSES[class_id],
                        "class_id": class_id,
                        "confidence": confidence,
                        "bbox": [int(x1), int(y1), int(x2), int(y2)],
                        "center": [cx, cy]
                    })

                    track_id += 1

            return detections

        except Exception as e:
            print("❌ Detection Error:", e)
            return []

    # =====================================================
    # LANE COUNTING
    # =====================================================

    def count_by_lanes(self, detections: List[Dict], frame_shape):

        height, width = frame_shape[:2]

        lane_counts = {
            "north": 0,
            "south": 0,
            "east": 0,
            "west": 0
        }

        center_x = width // 2
        center_y = height // 2

        for det in detections:

            cx, cy = det["center"]

            # North lane
            if cy < center_y and abs(cx - center_x) < width * 0.25:
                lane_counts["north"] += 1

            # South lane
            elif cy > center_y and abs(cx - center_x) < width * 0.25:
                lane_counts["south"] += 1

            # East lane
            elif cx > center_x:
                lane_counts["east"] += 1

            # West lane
            else:
                lane_counts["west"] += 1

        return lane_counts

    # =====================================================
    # DETECTION STATISTICS
    # =====================================================

    def get_detection_statistics(self, detections):

        stats = {
            "total_vehicles": len(detections),
            "cars": 0,
            "motorcycles": 0,
            "buses": 0,
            "trucks": 0,
            "avg_confidence": 0
        }

        if len(detections) == 0:
            return stats

        for det in detections:

            cls = det["class"]

            if cls == "car":
                stats["cars"] += 1
            elif cls == "motorcycle":
                stats["motorcycles"] += 1
            elif cls == "bus":
                stats["buses"] += 1
            elif cls == "truck":
                stats["trucks"] += 1

        confidences = [d["confidence"] for d in detections]

        stats["avg_confidence"] = float(np.mean(confidences))

        return stats

    # =====================================================
    # FRAME ANNOTATION (OPTIONAL)
    # =====================================================

    def annotate_frame(self, frame, detections):

        annotated = frame.copy()

        colors = {
            "car": (0, 255, 0),
            "motorcycle": (255, 0, 255),
            "bus": (0, 0, 255),
            "truck": (0, 165, 255)
        }

        for det in detections:

            x1, y1, x2, y2 = det["bbox"]
            vehicle_class = det["class"]
            conf = det["confidence"]

            color = colors.get(vehicle_class, (255, 255, 255))

            cv2.rectangle(
                annotated,
                (x1, y1),
                (x2, y2),
                color,
                2
            )

            label = f"{vehicle_class} {conf:.2f}"

            cv2.putText(
                annotated,
                label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2
            )

        return annotated

    # =====================================================
    # DRAW LANE ROIs
    # =====================================================

    def draw_lane_rois(self, frame):

        annotated = frame.copy()

        height, width = frame.shape[:2]

        center_x = width // 2
        center_y = height // 2

        cv2.line(
            annotated,
            (center_x, 0),
            (center_x, height),
            (255, 255, 0),
            2
        )

        cv2.line(
            annotated,
            (0, center_y),
            (width, center_y),
            (255, 255, 0),
            2
        )

        return annotated


# =====================================================
# SINGLETON MODEL INSTANCE
# =====================================================

_detector_instance = None


def get_video_detector():

    global _detector_instance

    if _detector_instance is None:
        _detector_instance = VideoVehicleDetector()

    return _detector_instance


def reset_detector():

    global _detector_instance

    _detector_instance = None

    print("✅ Detector reset")