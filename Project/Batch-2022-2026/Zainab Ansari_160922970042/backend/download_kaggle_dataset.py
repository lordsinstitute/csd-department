# backend/download_kaggle_dataset.py

"""
Download Traffic Dataset from Kaggle
Smaller, better quality dataset for the project
"""

import os
import subprocess
from pathlib import Path

def setup_kaggle():
    """Setup Kaggle API"""
    print("\n" + "="*60)
    print("📥 KAGGLE DATASET DOWNLOADER")
    print("="*60 + "\n")
    
    # Check if kaggle is installed
    try:
        import kaggle
        print("✅ Kaggle library installed")
    except ImportError:
        print("❌ Kaggle library not found")
        print("   Installing...")
        subprocess.check_call(['pip', 'install', 'kaggle'])
        print("✅ Kaggle installed")
    
    # Check for Kaggle credentials
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_json = kaggle_dir / 'kaggle.json'
    
    if not kaggle_json.exists():
        print("\n❌ Kaggle API credentials not found")
        print("\nTo setup Kaggle API:")
        print("1. Go to: https://www.kaggle.com/settings")
        print("2. Scroll to 'API' section")
        print("3. Click 'Create New Token'")
        print("4. Save kaggle.json to: " + str(kaggle_dir))
        print("\nOr run:")
        print(f"   mkdir -p {kaggle_dir}")
        print(f"   # Place your kaggle.json in {kaggle_dir}")
        return False
    
    print("✅ Kaggle credentials found")
    return True

def download_traffic_dataset():
    """Download traffic vehicles dataset from Kaggle"""
    
    if not setup_kaggle():
        return
    
    # Create datasets directory
    datasets_dir = Path("datasets/traffic_videos")
    datasets_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n" + "="*60)
    print("📦 DOWNLOADING TRAFFIC DATASET")
    print("="*60)
    print(f"\nDataset: Traffic Vehicles Object Detection")
    print(f"Size: ~500 MB")
    print(f"Location: {datasets_dir.absolute()}")
    print("\n" + "="*60 + "\n")
    
    # Download dataset
    try:
        import kaggle
        
        print("Downloading... (this may take a few minutes)")
        
        kaggle.api.dataset_download_files(
            'kmader/traffic-vehicles-object-detection',
            path=str(datasets_dir),
            unzip=True
        )
        
        print("\n✅ Download complete!")
        print(f"   Files saved to: {datasets_dir.absolute()}")
        
        # List downloaded files
        files = list(datasets_dir.glob("*.*"))
        print(f"\n📁 Downloaded {len(files)} files")
        
        for i, file in enumerate(files[:10], 1):
            size_mb = file.stat().st_size / (1024 * 1024)
            print(f"   {i}. {file.name} ({size_mb:.2f} MB)")
        
        if len(files) > 10:
            print(f"   ... and {len(files) - 10} more files")
        
        print("\n" + "="*60)
        print("✅ DATASET READY FOR USE")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error downloading dataset: {e}")
        print("\nAlternative: Manual download")
        print("1. Visit: https://www.kaggle.com/datasets/kmader/traffic-vehicles-object-detection")
        print("2. Click 'Download'")
        print(f"3. Extract to: {datasets_dir.absolute()}")

def download_alternative_dataset():
    """Download alternative smaller dataset"""
    print("\n" + "="*60)
    print("📦 ALTERNATIVE DATASET OPTIONS")
    print("="*60 + "\n")
    
    datasets = [
        {
            "name": "Traffic Vehicles Object Detection",
            "kaggle": "kmader/traffic-vehicles-object-detection",
            "size": "500 MB",
            "quality": "⭐⭐⭐⭐⭐"
        },
        {
            "name": "Self Driving Cars",
            "kaggle": "alincijov/self-driving-cars",
            "size": "350 MB",
            "quality": "⭐⭐⭐⭐"
        },
        {
            "name": "Traffic Sign Detection",
            "kaggle": "meowmeowmeowmeowmeow/gtsrb-german-traffic-sign",
            "size": "300 MB",
            "quality": "⭐⭐⭐⭐"
        }
    ]
    
    for i, ds in enumerate(datasets, 1):
        print(f"{i}. {ds['name']}")
        print(f"   Kaggle: {ds['kaggle']}")
        print(f"   Size: {ds['size']}")
        print(f"   Quality: {ds['quality']}")
        print()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--alternatives':
        download_alternative_dataset()
    else:
        download_traffic_dataset()