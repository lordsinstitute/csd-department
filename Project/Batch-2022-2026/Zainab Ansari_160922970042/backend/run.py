"""
NexusFlow Backend Launcher - FIXED VERSION
Run from backend directory: python run.py
"""

import sys
import os

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚦 NEXUSFLOW BACKEND LAUNCHER")
    print("="*60)
    print(f"📂 Working Directory: {backend_dir}")
    print(f"🐍 Python Path: {sys.path[0]}")
    print("="*60 + "\n")
    
    # Check dependencies
    print("🔍 CHECKING DEPENDENCIES")
    print("="*60)
    
    try:
        import torch
        print(f"✅ PyTorch {torch.__version__}")
        print(f"   CUDA available: {torch.cuda.is_available()}")
    except ImportError:
        print("⚠️  PyTorch not found")
    
    try:
        import ultralytics
        print(f"✅ Ultralytics (YOLOv8) {ultralytics.__version__}")
    except ImportError:
        print("⚠️  Ultralytics not found")
    
    try:
        import cv2
        print(f"✅ OpenCV {cv2.__version__}")
    except ImportError:
        print("⚠️  OpenCV not found")
    
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
    except ImportError:
        print("⚠️  FastAPI not found")
    
    print("\n" + "="*60)
    print("🔍 Checking YOLOv8 model...")
    model_path = os.path.join(backend_dir, 'models', 'yolov8n.pt')
    if os.path.exists(model_path):
        print(f"✅ YOLOv8 model found: {model_path}")
    else:
        print(f"⚠️  YOLOv8 model not found: {model_path}")
    
    print("\n🔍 Checking directories...")
    for dir_name in ['uploads/videos', 'models', 'datasets']:
        dir_path = os.path.join(backend_dir, dir_name)
        if os.path.exists(dir_path):
            print(f"✅ Exists: {dir_name}")
        else:
            print(f"⚠️  Missing: {dir_name}")
            os.makedirs(dir_path, exist_ok=True)
            print(f"   Created: {dir_name}")
    
    print("\n" + "="*60)
    print("🚀 STARTING NEXUSFLOW BACKEND")
    print("="*60)
    print("Server: http://0.0.0.0:8000")
    print("API Docs: http://0.0.0.0:8000/docs")
    print("WebSocket: ws://0.0.0.0:8000/ws")
    print("\nPress CTRL+C to stop...")
    print("="*60 + "\n")
    
    # Import uvicorn
    import uvicorn
    
    # Run with import string for reload support
    uvicorn.run(
        "app.main:app",  # Import string instead of app object
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        reload_dirs=[backend_dir]
    )