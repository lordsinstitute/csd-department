# backend/download_datasets.py

"""
Dataset Download Helper
Downloads sample traffic videos for testing
"""

import requests
from pathlib import Path
from tqdm import tqdm

def download_file(url: str, output_path: Path):
    """Download file with progress bar"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(output_path, 'wb') as file, tqdm(
        desc=output_path.name,
        total=total_size,
        unit='B',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            file.write(data)
            progress_bar.update(len(data))

def download_sample_videos():
    """Download sample traffic videos from Pexels"""
    print("="*60)
    print("📥 DOWNLOADING SAMPLE TRAFFIC VIDEOS")
    print("="*60)
    
    # Create directory
    output_dir = Path("datasets/traffic_videos")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Sample video URLs (these are examples - replace with actual Pexels API)
    videos = {
        "intersection_1.mp4": "https://example.com/video1.mp4",  # Replace with actual URLs
        "intersection_2.mp4": "https://example.com/video2.mp4",
        "highway_traffic.mp4": "https://example.com/video3.mp4"
    }
    
    print("\n⚠️  Manual Download Required")
    print("\nPlease download traffic videos from:")
    print("1. Pexels: https://www.pexels.com/search/videos/traffic/")
    print("2. Pixabay: https://pixabay.com/videos/search/traffic/")
    print("3. YouTube (with yt-dlp)")
    print(f"\nSave to: {output_dir.absolute()}")
    
    print("\n" + "="*60)

def print_dataset_instructions():
    """Print detailed dataset download instructions"""
    print("\n" + "="*60)
    print("📚 DATASET DOWNLOAD GUIDE")
    print("="*60)
    
    print("\n1️⃣  UA-DETRAC (Vehicle Detection Training)")
    print("-" * 60)
    print("Website: https://detrac-db.rit.albany.edu/")
    print("\nSteps:")
    print("  1. Register for free academic account")
    print("  2. Download 'DETRAC-train-data.zip' (7 GB)")
    print("  3. Download 'DETRAC-Train-Annotations-XML.zip' (50 MB)")
    print("  4. Extract to:")
    print("     datasets/ua-detrac/videos/")
    print("     datasets/ua-detrac/annotations/")
    
    print("\n2️⃣  METR-LA (Traffic Prediction)")
    print("-" * 60)
    print("Google Drive: https://drive.google.com/drive/folders/10FOTa6HXPqX8Pf5WRoRwcFnW9BrNZEIX")
    print("\nSteps:")
    print("  1. Download 'metr-la.h5' (34 MB)")
    print("  2. Download 'adj_mx.pkl' (2 MB)")
    print("  3. Download 'graph_sensor_ids.txt' (1 KB)")
    print("  4. Place in: datasets/metr-la/")
    
    print("\n3️⃣  Sample Videos (Quick Testing)")
    print("-" * 60)
    print("Pexels (Free): https://www.pexels.com/search/videos/traffic%20intersection/")
    print("\nRecommended:")
    print("  - Traffic Intersection 4K")
    print("  - Busy City Intersection")
    print("  - Highway Traffic Flow")
    print("  Save to: datasets/traffic_videos/")
    
    print("\n4️⃣  YouTube Videos (Using yt-dlp)")
    print("-" * 60)
    print("Install: pip install yt-dlp")
    print("\nExample:")
    print('  yt-dlp -f "best[height<=1080]" \\')
    print('    "https://www.youtube.com/watch?v=VIDEO_ID" \\')
    print('    -o "datasets/traffic_videos/sample.mp4"')
    
    print("\n" + "="*60)
    print("✅ After downloading, verify with:")
    print("   python -c \"from app.datasets import setup_datasets; setup_datasets()\"")
    print("="*60 + "\n")

if __name__ == "__main__":
    print_dataset_instructions()
    download_sample_videos()