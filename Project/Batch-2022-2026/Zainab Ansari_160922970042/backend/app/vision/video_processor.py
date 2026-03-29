"""
Video Processor - PRODUCTION VERSION
Handles frame-by-frame video analysis with full detection pipeline
"""

import cv2
import numpy as np
from typing import Dict, Optional, List
import time

class VideoProcessor:
    def __init__(self):
        """Initialize video processor"""
        self.detector = None
        self.tracker = None
        self.lane_counter = None
        self.accident_detector = None
        self.heatmap_generator = None
        
        self.frame_count = 0
        self.initialized = False
        self.last_process_time = 0
        
        print("📦 VideoProcessor initialized")
        
    def _initialize_components(self, frame_shape):
        """Initialize components that need frame dimensions"""
        if self.initialized:
            return
            
        height, width = frame_shape[:2]
        
        # Initialize detector
        try:
            from .vehicle_detector import VehicleDetector
            self.detector = VehicleDetector()
            print(f"✅ YOLOv8 detector loaded")
        except Exception as e:
            print(f"⚠️ YOLOv8 detector failed: {e}")
            self.detector = None
        
        # Initialize tracker
        try:
            from .vehicle_tracker import VehicleTracker
            self.tracker = VehicleTracker()
            print(f"✅ ByteTrack tracker loaded")
        except Exception as e:
            print(f"⚠️ ByteTrack tracker failed: {e}")
            self.tracker = None
        
        # Initialize lane counter
        try:
            from .lane_counter import LaneCounter
            self.lane_counter = LaneCounter(frame_width=width, frame_height=height)
            print(f"✅ Lane counter loaded")
        except Exception as e:
            print(f"⚠️ Lane counter failed: {e}")
            self.lane_counter = None
        
        # Initialize accident detector
        try:
            from .accident_detector import AccidentDetector
            self.accident_detector = AccidentDetector()
            print(f"✅ Accident detector loaded")
        except Exception as e:
            print(f"⚠️ Accident detector failed: {e}")
            self.accident_detector = None
        
        # Initialize heatmap
        try:
            from .heatmap_generator import HeatmapGenerator
            self.heatmap_generator = HeatmapGenerator(width=width, height=height)
            print(f"✅ Heatmap generator loaded")
        except Exception as e:
            print(f"⚠️ Heatmap generator failed: {e}")
            self.heatmap_generator = None
        
        self.initialized = True
        print(f"🎯 Video processor ready for {width}x{height}")
        
    def process_frame(self, frame: np.ndarray) -> Dict:
        """Process single frame - GUARANTEED to return valid structure"""
        start_time = time.time()
        self.frame_count += 1
        
        # Initialize on first frame
        if not self.initialized:
            self._initialize_components(frame.shape)
        
        # Default response structure - ALWAYS valid
        result = {
            'frame_number': self.frame_count,
            'timestamp': self.frame_count / 30.0,
            'detections': [],
            'lane_counts': {
                'north': 0,
                'south': 0,
                'east': 0,
                'west': 0
            },
            'heatmap': {
                'cells': [],
                'grid_size': 50,
                'max_density': 0
            },
            'total_vehicles': 0,
            'statistics': {
                'total_detections': 0,
                'avg_confidence': 0.0,
                'vehicle_types': {},
                'active_tracks': 0
            },
            'accident': None,
            'emergency_detected': False,
            'processing_time_ms': 0
        }
        
        try:
            # Step 1: Detect vehicles
            detections = []
            if self.detector:
                try:
                    detections = self.detector.detect(frame)
                except Exception as e:
                    print(f"⚠️ Detection error: {e}")
            
            # Step 2: Track vehicles
            tracked_detections = detections
            if self.tracker and detections:
                try:
                    tracked_detections = self.tracker.update(detections)
                except Exception as e:
                    print(f"⚠️ Tracking error: {e}")
            
            # Update result with detections
            result['detections'] = tracked_detections
            result['total_vehicles'] = len(tracked_detections)
            
            # Step 3: Count by lane
            if self.lane_counter and tracked_detections:
                try:
                    lane_counts = self.lane_counter.count_by_lane(tracked_detections, frame.shape)
                    result['lane_counts'] = lane_counts
                except Exception as e:
                    print(f"⚠️ Lane counting error: {e}")
            
            # Step 4: Check for accidents
            if self.accident_detector and tracked_detections:
                try:
                    accident = self.accident_detector.detect(tracked_detections)
                    result['accident'] = accident
                except Exception as e:
                    print(f"⚠️ Accident detection error: {e}")
            
            # Step 5: Generate heatmap
            if self.heatmap_generator and tracked_detections:
                try:
                    self.heatmap_generator.update(tracked_detections)
                    heatmap = self.heatmap_generator.get_heatmap_data()
                    result['heatmap'] = heatmap
                except Exception as e:
                    print(f"⚠️ Heatmap error: {e}")
            
            # Calculate statistics
            if tracked_detections:
                confidences = [d.get('confidence', 0) for d in tracked_detections]
                result['statistics']['avg_confidence'] = float(np.mean(confidences))
                
                # Vehicle types
                vehicle_types = {}
                for det in tracked_detections:
                    vtype = det.get('class', 'unknown')
                    vehicle_types[vtype] = vehicle_types.get(vtype, 0) + 1
                result['statistics']['vehicle_types'] = vehicle_types
                
                # Active tracks
                if self.tracker:
                    try:
                        result['statistics']['active_tracks'] = len(self.tracker.get_active_tracks())
                    except:
                        result['statistics']['active_tracks'] = len(tracked_detections)
                
                # Check for emergency vehicles
                emergency_classes = ['ambulance', 'fire_truck', 'police']
                result['emergency_detected'] = any(
                    d.get('class') in emergency_classes for d in tracked_detections
                )
            
            # Processing time
            result['processing_time_ms'] = round((time.time() - start_time) * 1000, 2)
            self.last_process_time = result['processing_time_ms']
            
        except Exception as e:
            print(f"❌ Frame processing error: {e}")
            # Result already has default values
        
        return result
    
    def reset(self):
        """Reset processor state"""
        self.frame_count = 0
        self.initialized = False
        
        # Clear components
        self.tracker = None
        self.accident_detector = None
        self.heatmap_generator = None
        self.lane_counter = None
        
        print("♻️ Video processor reset")
    
    def get_stats(self):
        """Get processor statistics"""
        return {
            'initialized': self.initialized,
            'frames_processed': self.frame_count,
            'last_processing_time_ms': self.last_process_time,
            'detector_available': self.detector is not None,
            'tracker_available': self.tracker is not None
        }