# backend/setup.py

"""
Setup script for NexusFlow backend
Downloads YOLOv8 model and sets up directories
"""

import subprocess
import sys
from pathlib import Path
from ultralytics import YOLO

def setup_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    
    dirs = [
        "uploads/videos",
        "models",
        "datasets/ua-detrac/videos",
        "datasets/ua-detrac/annotations",
        "datasets/metr-la",
        "logs"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"   ✅ {dir_path}")

def download_yolo_model():
    """Download YOLOv8 model"""
    print("\n🔥 Downloading YOLOv8 model...")
    
    try:
        # This will download yolov8n.pt automatically
        model = YOLO('yolov8n.pt')
        print("   ✅ YOLOv8n model downloaded")
        
        # Save to models directory
        model_path = Path("models/yolov8n.pt")
        if not model_path.exists():
            # Copy from cache
            import shutil
            from ultralytics.utils import ASSETS
            cache_path = Path.home() / '.cache' / 'ultralytics' / 'yolov8n.pt'
            if cache_path.exists():
                shutil.copy(cache_path, model_path)
                print(f"   ✅ Model saved to {model_path}")
        
    except Exception as e:
        print(f"   ⚠️  Error downloading model: {e}")

def install_requirements():
    """Install Python requirements"""
    print("\n📦 Installing requirements...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("   ✅ Requirements installed")
    except Exception as e:
        print(f"   ⚠️  Error installing requirements: {e}")

def setup_sumo():
    """Setup SUMO simulator"""
    print("\n🚦 Checking SUMO installation...")
    
    try:
        import sumo
        print("   ✅ SUMO installed")
    except ImportError:
        print("   ⚠️  SUMO not found")
        print("   Install from: https://www.eclipse.org/sumo/")

def main():
    """Main setup function"""
    print("\n" + "="*60)
    print("🚀 NEXUSFLOW BACKEND SETUP")
    print("="*60 + "\n")
    
    # Create directories
    setup_directories()
    
    # Install requirements
    install_requirements()
    
    # Download YOLO model
    download_yolo_model()
    
    # Check SUMO
    setup_sumo()
    
    print("\n" + "="*60)
    print("✅ SETUP COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("1. Download datasets (optional):")
    print("   - UA-DETRAC: https://detrac-db.rit.albany.edu/")
    print("   - METR-LA: https://github.com/liyaguang/DCRNN")
    print("\n2. Start the backend:")
    print("   python run.py")
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()