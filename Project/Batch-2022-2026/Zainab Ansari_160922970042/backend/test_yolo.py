# backend/test_yolo.py

"""
Test YOLOv8 Detection
Quick script to verify YOLO is working
"""

import cv2
import numpy as np
from app.vision.vehicle_detector import VehicleDetector
from app.vision.lane_counter import LaneCounter

def test_yolo_on_image():
    """Test YOLO on a sample image"""
    print("="*60)
    print("🧪 TESTING YOLO DETECTION")
    print("="*60)
    
    # Create detector
    detector = VehicleDetector()
    
    # Create a test image (black with white rectangle as "vehicle")
    test_image = np.zeros((720, 1280, 3), dtype=np.uint8)
    
    # Draw some rectangles to simulate vehicles
    cv2.rectangle(test_image, (100, 200), (200, 300), (255, 255, 255), -1)
    cv2.rectangle(test_image, (400, 300), (500, 400), (255, 255, 255), -1)
    cv2.rectangle(test_image, (700, 150), (800, 250), (255, 255, 255), -1)
    
    print("\n1️⃣  Running detection on test image...")
    
    # Detect
    detections = detector.detect(test_image)
    
    print(f"✅ Found {len(detections)} detections")
    
    if detections:
        print("\nDetections:")
        for i, det in enumerate(detections):
            print(f"   {i+1}. {det['class']} (conf: {det['confidence']:.2f})")
    
    # Test lane counter
    print("\n2️⃣  Testing lane counter...")
    lane_counter = LaneCounter(1280, 720)
    
    lane_counts = lane_counter.count_vehicles(detections)
    
    print(f"✅ Lane counts: {lane_counts}")
    
    print("\n" + "="*60)
    print("✅ YOLO TEST COMPLETE")
    print("="*60 + "\n")

def test_yolo_on_video(video_path: str = None):
    """Test YOLO on a video file"""
    if not video_path:
        print("⚠️  No video path provided")
        return
    
    from pathlib import Path
    if not Path(video_path).exists():
        print(f"❌ Video not found: {video_path}")
        return
    
    print("="*60)
    print("🎥 TESTING YOLO ON VIDEO")
    print("="*60)
    
    from app.vision.video_processor import VideoProcessor
    
    # Create processor
    processor = VideoProcessor(video_path)
    
    print(f"\nVideo: {processor.video_path.name}")
    print(f"Resolution: {processor.width}x{processor.height}")
    print(f"FPS: {processor.fps}")
    print(f"Duration: {processor.duration:.2f}s")
    
    # Process first 10 frames
    print("\nProcessing first 10 frames...")
    
    for i in range(10):
        result = processor.process_next_frame()
        
        if not result:
            break
        
        print(f"Frame {result['frame_number']}: {result['total_vehicles']} vehicles")
        print(f"  Lane counts: {result['lane_counts']}")
    
    processor.release()
    
    print("\n" + "="*60)
    print("✅ VIDEO TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == "__main__":
    import sys
    
    # Test on image
    test_yolo_on_image()
    
    # Test on video if path provided
    if len(sys.argv) > 1:
        test_yolo_on_video(sys.argv[1])
    else:
        print("💡 To test on video: python test_yolo.py path/to/video.mp4")