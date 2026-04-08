"""
Vehicle Tracking using ByteTrack
Assigns unique IDs to detected vehicles across frames
"""

import numpy as np
from collections import defaultdict
from typing import List, Dict, Tuple

class VehicleTracker:
    def __init__(self, max_age: int = 30, min_hits: int = 3, iou_threshold: float = 0.3):
        """
        ByteTrack-style multi-object tracker
        
        Args:
            max_age: Maximum frames to keep lost tracks
            min_hits: Minimum detections before confirmed
            iou_threshold: IOU threshold for matching
        """
        self.max_age = max_age
        self.min_hits = min_hits
        self.iou_threshold = iou_threshold
        
        self.tracks = {}
        self.next_id = 1
        self.frame_count = 0
        
    def update(self, detections: List[Dict]) -> List[Dict]:
        """
        Update tracker with new detections
        
        Args:
            detections: List of {bbox, class, confidence}
            
        Returns:
            List of tracked detections with IDs
        """
        self.frame_count += 1
        
        if len(detections) == 0:
            # Age all tracks
            self._age_tracks()
            return []
        
        # Match detections to existing tracks
        matched, unmatched_dets, unmatched_tracks = self._match_detections(detections)
        
        # Update matched tracks
        tracked_detections = []
        for det_idx, track_id in matched:
            detection = detections[det_idx]
            self.tracks[track_id]['bbox'] = detection['bbox']
            self.tracks[track_id]['age'] = 0
            self.tracks[track_id]['hits'] += 1
            
            # Add tracking ID to detection
            detection['track_id'] = track_id
            tracked_detections.append(detection)
        
        # Create new tracks for unmatched detections
        for det_idx in unmatched_dets:
            detection = detections[det_idx]
            track_id = self.next_id
            self.next_id += 1
            
            self.tracks[track_id] = {
                'bbox': detection['bbox'],
                'class': detection['class'],
                'age': 0,
                'hits': 1,
                'confidence': detection['confidence']
            }
            
            detection['track_id'] = track_id
            tracked_detections.append(detection)
        
        # Age unmatched tracks
        for track_id in unmatched_tracks:
            self.tracks[track_id]['age'] += 1
        
        # Remove old tracks
        self._remove_old_tracks()
        
        return tracked_detections
    
    def _match_detections(self, detections: List[Dict]) -> Tuple[List, List, List]:
        """Match detections to tracks using IOU"""
        if len(self.tracks) == 0:
            return [], list(range(len(detections))), []
        
        # Compute IOU matrix
        track_ids = list(self.tracks.keys())
        iou_matrix = np.zeros((len(detections), len(track_ids)))
        
        for i, det in enumerate(detections):
            for j, track_id in enumerate(track_ids):
                iou_matrix[i, j] = self._compute_iou(
                    det['bbox'],
                    self.tracks[track_id]['bbox']
                )
        
        # Hungarian matching (greedy for simplicity)
        matched = []
        unmatched_dets = list(range(len(detections)))
        unmatched_tracks = track_ids.copy()
        
        while len(unmatched_dets) > 0 and len(unmatched_tracks) > 0:
            # Find best match
            max_iou = 0
            best_det = None
            best_track = None
            
            for i in unmatched_dets:
                for j, track_id in enumerate(unmatched_tracks):
                    track_idx = track_ids.index(track_id)
                    if iou_matrix[i, track_idx] > max_iou:
                        max_iou = iou_matrix[i, track_idx]
                        best_det = i
                        best_track = track_id
            
            if max_iou < self.iou_threshold:
                break
            
            matched.append((best_det, best_track))
            unmatched_dets.remove(best_det)
            unmatched_tracks.remove(best_track)
        
        return matched, unmatched_dets, unmatched_tracks
    
    def _compute_iou(self, bbox1: List[float], bbox2: List[float]) -> float:
        """Compute Intersection over Union"""
        x1_min, y1_min, x1_max, y1_max = bbox1
        x2_min, y2_min, x2_max, y2_max = bbox2
        
        # Intersection
        x_min = max(x1_min, x2_min)
        y_min = max(y1_min, y2_min)
        x_max = min(x1_max, x2_max)
        y_max = min(y1_max, y2_max)
        
        if x_max < x_min or y_max < y_min:
            return 0.0
        
        intersection = (x_max - x_min) * (y_max - y_min)
        
        # Union
        area1 = (x1_max - x1_min) * (y1_max - y1_min)
        area2 = (x2_max - x2_min) * (y2_max - y2_min)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _age_tracks(self):
        """Increment age of all tracks"""
        for track_id in self.tracks:
            self.tracks[track_id]['age'] += 1
    
    def _remove_old_tracks(self):
        """Remove tracks that haven't been seen recently"""
        to_remove = []
        for track_id, track in self.tracks.items():
            if track['age'] > self.max_age:
                to_remove.append(track_id)
        
        for track_id in to_remove:
            del self.tracks[track_id]
    
    def get_active_tracks(self) -> Dict:
        """Get all currently active tracks"""
        return {
            track_id: track 
            for track_id, track in self.tracks.items() 
            if track['hits'] >= self.min_hits and track['age'] == 0
        }