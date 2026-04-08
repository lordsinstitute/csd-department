from fastapi import APIRouter, UploadFile, File, HTTPException
import cv2
import base64
import os
from datetime import datetime
from pathlib import Path

from app.services.video_detector import get_video_detector
from app.config.video_config import VideoConfig

router = APIRouter(prefix="/api/video", tags=["video"])

UPLOAD_FOLDER = VideoConfig.UPLOAD_DIR
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

video_capture = None
frame_number = 0
detector = get_video_detector()


# =====================================
# Upload Video
# =====================================

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):

    global video_capture, frame_number

    # Validate file extension
    if not VideoConfig.is_valid_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid video format. Allowed: mp4, avi, mov, mkv"
        )

    filename = f"traffic_{datetime.now().strftime('%Y%m%d_%H%M%S')}{Path(file.filename).suffix}"
    filepath = UPLOAD_FOLDER / filename

    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    # Release previous video if loaded
    if video_capture:
        video_capture.release()

    video_capture = cv2.VideoCapture(str(filepath))
    frame_number = 0

    if not video_capture.isOpened():
        raise HTTPException(status_code=500, detail="Failed to open video")

    width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = video_capture.get(cv2.CAP_PROP_FPS)

    if fps <= 0:
        fps = VideoConfig.DEFAULT_FPS

    total_frames = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))

    return {
        "filename": filename,
        "video_info": {
            "width": width,
            "height": height,
            "fps": fps,
            "total_frames": total_frames,
            "duration": round(total_frames / fps, 2) if fps > 0 else 0
        }
    }


# =====================================
# Get Next Frame
# =====================================

@router.get("/next-frame")
async def get_next_frame():

    global video_capture, frame_number

    if video_capture is None:
        return {"status": "no_video"}

    ret, frame = video_capture.read()

    if not ret:
        return {"status": "end_of_video"}

    frame_number += 1

    # ----------------------
    # YOLO Detection
    # ----------------------

    detections = detector.detect_vehicles(frame)

    # ----------------------
    # Lane Counting
    # ----------------------

    lane_counts = detector.count_by_lanes(detections, frame.shape)

    total = sum(lane_counts.values())

    # ----------------------
    # Encode Frame
    # ----------------------

    success, buffer = cv2.imencode(".jpg", frame)

    if not success:
        raise HTTPException(status_code=500, detail="Frame encoding failed")

    frame_base64 = base64.b64encode(buffer).decode("utf-8")

    # ----------------------
    # Detection Statistics
    # ----------------------

    if detections:
        avg_conf = sum(d.get("confidence", 0) for d in detections) / len(detections)
    else:
        avg_conf = 0

    return {
        "frame": frame_base64,
        "frame_number": frame_number,
        "total_vehicles": total,
        "detections": detections,
        "lane_counts": lane_counts,
        "heatmap": {
            "cells": []
        },
        "statistics": {
            "avg_confidence": round(avg_conf, 3),
            "active_tracks": len(detections)
        }
    }


# =====================================
# Reset Video
# =====================================

@router.post("/reset")
async def reset_video():

    global video_capture, frame_number

    if video_capture:
        video_capture.set(cv2.CAP_PROP_POS_FRAMES, 0)

    frame_number = 0

    return {"status": "reset"}


# =====================================
# Cleanup
# =====================================

@router.delete("/cleanup")
async def cleanup():

    global video_capture

    if video_capture:
        video_capture.release()
        video_capture = None

    return {"status": "success"}