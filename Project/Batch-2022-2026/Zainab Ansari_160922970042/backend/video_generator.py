# backend/video_generator.py

"""
Traffic Video Generator
Creates synthetic traffic videos for testing the video processing system
"""

import cv2
import numpy as np
from pathlib import Path
import random

class TrafficVideoGenerator:
    """Generate synthetic traffic videos for testing"""
    
    def __init__(self, width=1280, height=720, fps=30):
        self.width = width
        self.height = height
        self.fps = fps
        
        # Vehicle colors
        self.colors = [
            (255, 0, 0),    # Blue (BGR)
            (0, 255, 0),    # Green
            (0, 0, 255),    # Red
            (255, 255, 0),  # Cyan
            (255, 0, 255),  # Magenta
            (0, 255, 255),  # Yellow
        ]
    
    def generate_video(self, filename: str, duration_seconds: int = 30):
        """
        Generate a synthetic traffic video
        
        Args:
            filename: Output video filename
            duration_seconds: Video duration in seconds
        """
        output_path = Path(filename)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(
            str(output_path),
            fourcc,
            self.fps,
            (self.width, self.height)
        )
        
        total_frames = duration_seconds * self.fps
        vehicles = []
        
        print(f"🎬 Generating video: {filename}")
        print(f"   Resolution: {self.width}x{self.height}")
        print(f"   Duration: {duration_seconds}s")
        print(f"   FPS: {self.fps}")
        print(f"   Total frames: {total_frames}")
        
        for frame_num in range(total_frames):
            # Create frame
            frame = self.create_frame()
            
            # Spawn new vehicles randomly
            if random.random() < 0.1:  # 10% chance per frame
                vehicles.append(self.spawn_vehicle())
            
            # Update and draw vehicles
            vehicles = self.update_vehicles(vehicles)
            frame = self.draw_vehicles(frame, vehicles)
            
            # Draw intersection
            frame = self.draw_intersection(frame)
            
            # Draw frame counter
            cv2.putText(
                frame,
                f"Frame: {frame_num}/{total_frames}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )
            
            # Write frame
            out.write(frame)
            
            # Progress
            if frame_num % 30 == 0:
                progress = (frame_num / total_frames) * 100
                print(f"   Progress: {progress:.1f}%")
        
        out.release()
        print(f"✅ Video generated: {output_path}")
        print(f"   Size: {output_path.stat().st_size / (1024*1024):.2f} MB")
    
    def create_frame(self):
        """Create base frame with road"""
        frame = np.ones((self.height, self.width, 3), dtype=np.uint8) * 50
        
        # Draw horizontal road
        road_height = int(self.height * 0.3)
        road_y = int(self.height * 0.35)
        cv2.rectangle(
            frame,
            (0, road_y),
            (self.width, road_y + road_height),
            (80, 80, 80),
            -1
        )
        
        # Draw vertical road
        road_width = int(self.width * 0.3)
        road_x = int(self.width * 0.35)
        cv2.rectangle(
            frame,
            (road_x, 0),
            (road_x + road_width, self.height),
            (80, 80, 80),
            -1
        )
        
        # Draw lane markings (dashed lines)
        # Horizontal
        for x in range(0, self.width, 40):
            cv2.line(
                frame,
                (x, road_y + road_height // 2),
                (x + 20, road_y + road_height // 2),
                (255, 255, 0),
                2
            )
        
        # Vertical
        for y in range(0, self.height, 40):
            cv2.line(
                frame,
                (road_x + road_width // 2, y),
                (road_x + road_width // 2, y + 20),
                (255, 255, 0),
                2
            )
        
        return frame
    
    def spawn_vehicle(self):
        """Spawn a new vehicle"""
        lane = random.choice(['north', 'south', 'east', 'west'])
        
        if lane == 'north':
            x = int(self.width * 0.45)
            y = 0
            dx = 0
            dy = random.uniform(2, 4)
        elif lane == 'south':
            x = int(self.width * 0.55)
            y = self.height
            dx = 0
            dy = -random.uniform(2, 4)
        elif lane == 'east':
            x = self.width
            y = int(self.height * 0.45)
            dx = -random.uniform(2, 4)
            dy = 0
        else:  # west
            x = 0
            y = int(self.height * 0.55)
            dx = random.uniform(2, 4)
            dy = 0
        
        return {
            'x': x,
            'y': y,
            'dx': dx,
            'dy': dy,
            'lane': lane,
            'color': random.choice(self.colors),
            'width': random.randint(40, 60),
            'height': random.randint(25, 35)
        }
    
    def update_vehicles(self, vehicles):
        """Update vehicle positions"""
        updated = []
        
        for vehicle in vehicles:
            vehicle['x'] += vehicle['dx']
            vehicle['y'] += vehicle['dy']
            
            # Remove if out of frame
            if (0 <= vehicle['x'] <= self.width and 
                0 <= vehicle['y'] <= self.height):
                updated.append(vehicle)
        
        return updated
    
    def draw_vehicles(self, frame, vehicles):
        """Draw vehicles on frame"""
        for vehicle in vehicles:
            x = int(vehicle['x'])
            y = int(vehicle['y'])
            w = vehicle['width']
            h = vehicle['height']
            
            # Draw vehicle rectangle
            cv2.rectangle(
                frame,
                (x - w//2, y - h//2),
                (x + w//2, y + h//2),
                vehicle['color'],
                -1
            )
            
            # Draw border
            cv2.rectangle(
                frame,
                (x - w//2, y - h//2),
                (x + w//2, y + h//2),
                (255, 255, 255),
                2
            )
        
        return frame
    
    def draw_intersection(self, frame):
        """Draw intersection center"""
        center_x = int(self.width * 0.5)
        center_y = int(self.height * 0.5)
        size = 50
        
        # Draw intersection box
        cv2.rectangle(
            frame,
            (center_x - size, center_y - size),
            (center_x + size, center_y + size),
            (100, 100, 100),
            -1
        )
        
        return frame


def generate_test_videos():
    """Generate multiple test videos"""
    generator = TrafficVideoGenerator()
    
    output_dir = Path("test_videos")
    output_dir.mkdir(exist_ok=True)
    
    # Generate different scenarios
    videos = [
        ("test_videos/light_traffic.mp4", 30),
        ("test_videos/medium_traffic.mp4", 30),
        ("test_videos/heavy_traffic.mp4", 30),
    ]
    
    for filename, duration in videos:
        generator.generate_video(filename, duration)
        print()


if __name__ == "__main__":
    print("="*60)
    print("🎬 TRAFFIC VIDEO GENERATOR")
    print("="*60)
    print()
    
    generate_test_videos()
    
    print()
    print("="*60)
    print("✅ ALL VIDEOS GENERATED!")
    print("="*60)
    print()
    print("📁 Videos saved in: test_videos/")
    print("   - light_traffic.mp4")
    print("   - medium_traffic.mp4")
    print("   - heavy_traffic.mp4")
    print()
    print("🎥 You can now upload these videos to test the system!")