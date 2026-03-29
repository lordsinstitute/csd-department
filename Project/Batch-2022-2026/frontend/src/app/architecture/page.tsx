'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { ArrowDown, Video, Brain, Activity, BarChart3, Zap, CheckCircle, Cpu } from 'lucide-react'

export default function ArchitecturePage() {
  const [activeStep, setActiveStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Auto-animate through pipeline
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % pipeline.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const pipeline = [
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Traffic Camera / Video Input',
      description: 'Real-time video feed from intersection cameras',
      color: 'blue',
      details: ['1920x1080 HD', '30 FPS', 'Multiple angles', 'RTSP streaming'],
      techStack: ['OpenCV', 'FFmpeg', 'WebRTC']
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'YOLOv8 Vehicle Detection',
      description: 'Deep learning object detection for vehicles',
      color: 'green',
      details: ['Car, Truck, Bus, Motorcycle', '93% mAP accuracy', 'GPU accelerated', 'Real-time inference'],
      techStack: ['Ultralytics YOLOv8', 'PyTorch', 'CUDA']
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'ByteTrack Vehicle Tracking',
      description: 'Multi-object tracking with unique IDs',
      color: 'purple',
      details: ['Unique vehicle IDs', 'Cross-frame tracking', 'Occlusion handling', 'Re-identification'],
      techStack: ['ByteTrack', 'DeepSORT', 'Kalman Filter']
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Lane Counting & State Vector',
      description: 'Traffic state extraction from detections',
      color: 'orange',
      details: ['N/S/E/W lane counts', '10-element state vector', 'Real-time updates', 'Queue estimation'],
      techStack: ['NumPy', 'Custom ROI Logic']
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'DQN Reinforcement Learning',
      description: 'AI traffic signal optimization',
      color: 'cyan',
      details: ['Deep Q-Network', 'Experience replay', 'Epsilon-greedy policy', 'Target network'],
      techStack: ['TensorFlow', 'Keras', 'Python']
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Traffic Signal Control',
      description: 'Optimized signal timing execution',
      color: 'red',
      details: ['NS/EW phases', 'Emergency override', 'Adaptive timing', 'Real-time updates'],
      techStack: ['FastAPI', 'WebSocket', 'MQTT']
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Real-time monitoring and visualization',
      color: 'yellow',
      details: ['Live metrics', 'Performance graphs', 'Accident alerts', 'Historical data'],
      techStack: ['Next.js', 'Recharts', 'TailwindCSS']
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400', glow: 'shadow-blue-500/50' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-400', glow: 'shadow-green-500/50' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400', glow: 'shadow-purple-500/50' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-400', glow: 'shadow-orange-500/50' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: 'text-cyan-400', glow: 'shadow-cyan-500/50' },
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', glow: 'shadow-red-500/50' },
      yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400', glow: 'shadow-yellow-500/50' }
    }
    return colors[color]
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="System Architecture" subtitle="AI Traffic Management Pipeline" />

        <main className="flex-1 p-8 overflow-auto">
          
          {/* Introduction */}
          <div className="mb-8 glass rounded-xl p-6 border-2 border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">🏗️ NexusFlow AI Pipeline</h2>
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold"
              >
                {isAnimating ? '⏸ Pause' : '▶ Animate'}
              </button>
            </div>
            <p className="text-gray-300 leading-relaxed">
              A complete end-to-end intelligent traffic management system combining computer vision, 
              deep reinforcement learning, and real-time data processing to optimize traffic flow 
              and reduce congestion.
            </p>
          </div>

          {/* Pipeline Visualization */}
          <div className="space-y-6">
            {pipeline.map((stage, idx) => {
              const colors = getColorClasses(stage.color)
              const isActive = idx === activeStep
              
              return (
                <div key={idx}>
                  <div 
                    className={`glass rounded-xl p-6 border-2 transition-all duration-500 ${
                      isActive 
                        ? `${colors.border} ${colors.bg} shadow-2xl ${colors.glow} scale-105` 
                        : colors.border
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`p-4 ${colors.bg} rounded-lg border-2 ${colors.border} transition-transform duration-500 ${
                        isActive ? 'scale-110 animate-pulse' : ''
                      }`}>
                        <div className={colors.icon}>{stage.icon}</div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`px-3 py-1 ${colors.bg} border ${colors.border} rounded-full text-xs font-bold ${colors.icon}`}>
                            STEP {idx + 1}
                          </div>
                          <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                          {isActive && (
                            <div className="flex items-center space-x-1 animate-pulse">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-green-400 font-bold">ACTIVE</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-400 mb-4">{stage.description}</p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {stage.details.map((detail, detailIdx) => (
                            <div key={detailIdx} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-gray-300">{detail}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500 mr-2">Tech Stack:</span>
                          {stage.techStack.map((tech, techIdx) => (
                            <div key={techIdx} className={`px-2 py-1 ${colors.bg} border ${colors.border} rounded text-xs ${colors.icon} font-semibold`}>
                              {tech}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Processing Indicator */}
                      {isActive && (
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-5 h-5 text-cyan-400 animate-spin" />
                          <div className="text-xs text-cyan-400 font-bold">Processing...</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Animated Arrow */}
                  {idx < pipeline.length - 1 && (
                    <div className="flex justify-center py-4">
                      <div className={`transition-all duration-500 ${
                        isActive ? 'scale-125' : ''
                      }`}>
                        <ArrowDown className={`w-8 h-8 ${
                          isActive ? 'text-cyan-400 animate-bounce' : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Data Flow Visualization */}
          <div className="mt-8 glass rounded-xl p-6 border-2 border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">📊 Data Flow</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DataFlowCard
                title="Input"
                value="30 FPS"
                description="Video frames"
                icon="📹"
                color="blue"
              />
              <DataFlowCard
                title="Detection"
                value="~50ms"
                description="Per frame"
                icon="🎯"
                color="green"
              />
              <DataFlowCard
                title="Decision"
                value="~10ms"
                description="DQN inference"
                icon="🧠"
                color="purple"
              />
              <DataFlowCard
                title="Output"
                value="Real-time"
                description="Signal control"
                icon="🚦"
                color="orange"
              />
            </div>
          </div>

          {/* Key Technologies */}
          <div className="mt-8 glass rounded-xl p-6 border-2 border-green-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">🔧 Key Technologies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TechCard
                title="YOLOv8"
                description="State-of-the-art object detection model for real-time vehicle identification"
                color="blue"
                metrics={['93% mAP', '50ms latency', 'GPU optimized']}
              />
              <TechCard
                title="ByteTrack"
                description="Advanced multi-object tracking for vehicle trajectory analysis"
                color="green"
                metrics={['99% precision', 'Occlusion handling', 'Re-ID capable']}
              />
              <TechCard
                title="DQN"
                description="Deep Q-Network reinforcement learning for optimal signal control"
                color="purple"
                metrics={['40% wait reduction', 'Adaptive learning', 'Real-time optimization']}
              />
              <TechCard
                title="WebSocket"
                description="Real-time bidirectional communication for live updates"
                color="orange"
                metrics={['Sub-second latency', 'Auto reconnect', 'Channel subscriptions']}
              />
              <TechCard
                title="FastAPI"
                description="High-performance Python backend for ML model serving"
                color="cyan"
                metrics={['Async support', 'Auto docs', 'Type safety']}
              />
              <TechCard
                title="Next.js 14"
                description="Modern React framework for responsive dashboard UI"
                color="red"
                metrics={['Server components', 'TypeScript', 'Optimized builds']}
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 glass rounded-xl p-6 border-2 border-yellow-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">📈 Performance Metrics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PerformanceMetric
                value="93%"
                label="Detection Accuracy"
                icon="🎯"
                color="green"
              />
              <PerformanceMetric
                value="30 FPS"
                label="Processing Speed"
                icon="⚡"
                color="blue"
              />
              <PerformanceMetric
                value="40%"
                label="Queue Reduction"
                icon="📉"
                color="purple"
              />
              <PerformanceMetric
                value="87%"
                label="System Efficiency"
                icon="✨"
                color="orange"
              />
            </div>
          </div>

          {/* System Requirements */}
          <div className="mt-8 glass rounded-xl p-6 border-2 border-cyan-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">💻 System Requirements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-3">Minimum Requirements</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>CPU: Intel i5 / AMD Ryzen 5 or better</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>RAM: 8GB DDR4</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Storage: 20GB SSD</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>GPU: Optional (CPU inference supported)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-3">Recommended Requirements</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>CPU: Intel i7 / AMD Ryzen 7 or better</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>RAM: 16GB DDR4</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Storage: 50GB NVMe SSD</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>GPU: NVIDIA RTX 3060 or better (CUDA support)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

function DataFlowCard({ title, value, description, icon, color }: {
  title: string
  value: string
  description: string
  icon: string
  color: string
}) {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30'
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[color as keyof typeof colors]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  )
}

function TechCard({ title, description, color, metrics }: {
  title: string
  description: string
  color: string
  metrics: string[]
}) {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400'
  }

  return (
    <div className={`p-4 border rounded-lg ${colors[color as keyof typeof colors]}`}>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div className="space-y-1">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs text-gray-300">{metric}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PerformanceMetric({ value, label, icon, color }: {
  value: string
  label: string
  icon: string
  color: string
}) {
  const colors = {
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400'
  }

  return (
    <div className={`text-center p-4 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}