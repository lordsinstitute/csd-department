# NexusFlow Backend

AI-Powered Traffic Control System with YOLOv8 & Deep Q-Learning

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup
```bash
python setup.py
```

This will:
- Create necessary directories
- Download YOLOv8 model
- Check SUMO installation

### 3. Run Server
```bash
python run.py
```

Server will start at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## 📁 Project Structure
```
backend/
├── app/
│   ├── api/              # API routes
│   ├── vision/           # YOLOv8 detection
│   ├── rl/               # DQN agent
│   ├── datasets/         # Dataset loaders
│   └── main.py           # FastAPI app
├── models/               # Trained models
├── datasets/             # Training data
├── uploads/              # Uploaded videos
└── run.py                # Server launcher
```

## 🎯 Features

### Computer Vision
- **YOLOv8n** vehicle detection
- Real-time processing (30 FPS GPU / 10-15 FPS CPU)
- Lane-based counting (N, S, E, W)
- Emergency vehicle detection

### Reinforcement Learning
- Deep Q-Network (DQN) agent
- Experience replay buffer
- Target network for stability
- Epsilon-greedy exploration

### API Endpoints

**Video Processing:**
- `POST /api/video/upload` - Upload traffic video
- `GET /api/video/next-frame` - Process next frame
- `GET /api/video/info` - Get video info

**Traffic Control:**
- `POST /api/traffic/optimize-signal` - Get DQN action
- `POST /api/traffic/emergency-override` - Emergency vehicle priority
- `GET /api/traffic/metrics` - Performance metrics

## 📊 Datasets

### UA-DETRAC (Vehicle Detection)
- **Download:** https://detrac-db.rit.albany.edu/
- **Size:** ~7 GB (training) + ~5 GB (test)
- **Extract to:** `datasets/ua-detrac/`

### METR-LA (Traffic Prediction)
- **Download:** https://drive.google.com/drive/folders/10FOTa6HXPqX8Pf5WRoRwcFnW9BrNZEIX
- **Size:** ~36 MB
- **Extract to:** `datasets/metr-la/`

## 🧪 Testing

### Test YOLO Detection
```bash
python test_yolo.py
```

### Test on Video
```bash
python test_yolo.py path/to/video.mp4
```

## 🔧 Configuration

Edit `.env` file:
```bash
# YOLO
YOLO_MODEL=yolov8n.pt
YOLO_CONF_THRESHOLD=0.45

# DQN
DQN_LEARNING_RATE=0.001
DQN_GAMMA=0.99
```

## 📝 API Usage Examples

### Upload Video
```python
import requests

files = {'file': open('traffic.mp4', 'rb')}
response = requests.post('http://localhost:8000/api/video/upload', files=files)
print(response.json())
```

### Get Next Frame
```python
response = requests.get('http://localhost:8000/api/video/next-frame')
result = response.json()

print(f"Vehicles detected: {result['total_vehicles']}")
print(f"Lane counts: {result['lane_counts']}")
print(f"DQN action: {result['dqn_action']}")
```

## 🐛 Troubleshooting

### CUDA not available
```bash
# Check PyTorch CUDA
python -c "import torch; print(torch.cuda.is_available())"

# Reinstall PyTorch with CUDA
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### YOLOv8 not found
```bash
# Manually download
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request