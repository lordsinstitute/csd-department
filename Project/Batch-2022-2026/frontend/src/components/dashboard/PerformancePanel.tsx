'use client'

import { useEffect, useState } from 'react'
import { Cpu, Zap, Activity, Clock, TrendingUp, Database } from 'lucide-react'

interface PerformanceMetrics {
  fps: number
  inference_latency: number
  cpu_usage: number
  gpu_usage: number
  memory_usage: number
  decision_time: number
  uptime: number
  total_frames_processed: number
}

export default function PerformancePanel() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    inference_latency: 0,
    cpu_usage: 0,
    gpu_usage: 0,
    memory_usage: 0,
    decision_time: 0,
    uptime: 0,
    total_frames_processed: 0
  })

  useEffect(() => {
    // Simulate performance metrics (in production, get from backend)
    const interval = setInterval(() => {
      setMetrics({
        fps: 28 + Math.random() * 4,
        inference_latency: 45 + Math.random() * 10,
        cpu_usage: 35 + Math.random() * 15,
        gpu_usage: 60 + Math.random() * 20,
        memory_usage: 45 + Math.random() * 10,
        decision_time: 8 + Math.random() * 4,
        uptime: Date.now() / 1000,
        total_frames_processed: Math.floor(Date.now() / 33) // ~30 fps
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  function formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="glass rounded-xl p-6 border-2 border-cyan-500/30">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-cyan-400" />
        System Performance
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* FPS */}
        <PerformanceMetric
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
          label="Detection FPS"
          value={metrics.fps.toFixed(1)}
          unit="fps"
          color="yellow"
          status={metrics.fps > 25 ? 'good' : 'warning'}
        />

        {/* Inference Latency */}
        <PerformanceMetric
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          label="Inference Latency"
          value={metrics.inference_latency.toFixed(0)}
          unit="ms"
          color="blue"
          status={metrics.inference_latency < 60 ? 'good' : 'warning'}
        />

        {/* CPU Usage */}
        <PerformanceMetric
          icon={<Cpu className="w-5 h-5 text-purple-400" />}
          label="CPU Usage"
          value={metrics.cpu_usage.toFixed(0)}
          unit="%"
          color="purple"
          status={metrics.cpu_usage < 70 ? 'good' : 'warning'}
          progress={metrics.cpu_usage}
        />

        {/* GPU Usage */}
        <PerformanceMetric
          icon={<Activity className="w-5 h-5 text-green-400" />}
          label="GPU Usage"
          value={metrics.gpu_usage.toFixed(0)}
          unit="%"
          color="green"
          status={metrics.gpu_usage < 90 ? 'good' : 'warning'}
          progress={metrics.gpu_usage}
        />

        {/* Memory Usage */}
        <PerformanceMetric
          icon={<Database className="w-5 h-5 text-orange-400" />}
          label="Memory Usage"
          value={metrics.memory_usage.toFixed(0)}
          unit="%"
          color="orange"
          status={metrics.memory_usage < 80 ? 'good' : 'warning'}
          progress={metrics.memory_usage}
        />

        {/* Decision Time */}
        <PerformanceMetric
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          label="Decision Time"
          value={metrics.decision_time.toFixed(1)}
          unit="ms"
          color="cyan"
          status={metrics.decision_time < 15 ? 'good' : 'warning'}
        />
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Uptime:</span>
            <span className="ml-2 text-white font-semibold">{formatUptime(metrics.uptime)}</span>
          </div>
          <div>
            <span className="text-gray-400">Frames Processed:</span>
            <span className="ml-2 text-white font-semibold">
              {metrics.total_frames_processed.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Health Indicator */}
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-400">System Healthy</span>
          </div>
          <span className="text-xs text-gray-400">All metrics within normal range</span>
        </div>
      </div>
    </div>
  )
}

function PerformanceMetric({ icon, label, value, unit, color, status, progress }: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  color: string
  status: 'good' | 'warning' | 'critical'
  progress?: number
}) {
  const colors = {
    yellow: 'bg-yellow-500/10 border-yellow-500/30',
    blue: 'bg-blue-500/10 border-blue-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30',
    cyan: 'bg-cyan-500/10 border-cyan-500/30'
  }

  const statusColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400'
  }

  return (
    <div className={`p-4 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <div className={`w-2 h-2 rounded-full ${
          status === 'good' ? 'bg-green-400' :
          status === 'warning' ? 'bg-yellow-400' :
          'bg-red-400'
        }`}></div>
      </div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex items-baseline space-x-1">
        <div className={`text-2xl font-bold ${statusColors[status]}`}>{value}</div>
        <div className="text-xs text-gray-500">{unit}</div>
      </div>
      
      {progress !== undefined && (
        <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              status === 'good' ? 'bg-green-500' :
              status === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}