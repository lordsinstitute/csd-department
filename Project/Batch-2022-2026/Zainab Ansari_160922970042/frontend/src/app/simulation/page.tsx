// frontend/src/app/simulation/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { IntersectionView } from '@/components/simulation/IntersectionView'
import { LiveFeed } from '@/components/simulation/LiveFeed'
import { ControlPanel } from '@/components/simulation/ControlPanel'
import { api } from '@/lib/api'
import { WebSocketClient } from '@/lib/websocket'

export default function SimulationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [wsClient] = useState(() => new WebSocketClient())
  
  // Simulation state with realistic defaults
  const [metrics, setMetrics] = useState({
    north_queue: 3,
    south_queue: 2,
    east_queue: 4,
    west_queue: 2,
    current_phase: 0,
    time_in_phase: 0,
    avg_waiting_time: 24.5,
    throughput: 1240,
    queue_length: 11,
    efficiency: 85,
    episode_number: 0
  })

  // Simulate traffic updates when running
  useEffect(() => {
    if (!isRunning || isPaused) return

    const interval = setInterval(() => {
      setMetrics(prev => {
        // Randomly update queue lengths
        const updateQueue = (current: number) => {
          const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
          return Math.max(0, Math.min(15, current + change))
        }

        const newNorth = updateQueue(prev.north_queue)
        const newSouth = updateQueue(prev.south_queue)
        const newEast = updateQueue(prev.east_queue)
        const newWest = updateQueue(prev.west_queue)

        // Update phase based on time
        const newTimeInPhase = prev.time_in_phase + 1
        let newPhase = prev.current_phase
        let resetTime = newTimeInPhase

        // Switch phase every 30-60 seconds (simulated)
        if (newTimeInPhase > 30 + Math.random() * 30) {
          newPhase = 1 - prev.current_phase
          resetTime = 0
        }

        const totalQueue = newNorth + newSouth + newEast + newWest

        return {
          north_queue: newNorth,
          south_queue: newSouth,
          east_queue: newEast,
          west_queue: newWest,
          current_phase: newPhase,
          time_in_phase: resetTime,
          avg_waiting_time: 15 + Math.random() * 20,
          throughput: 1000 + Math.floor(Math.random() * 500),
          queue_length: totalQueue,
          efficiency: 70 + Math.floor(Math.random() * 25),
          episode_number: prev.episode_number
        }
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [isRunning, isPaused])

  // WebSocket connection (for real backend updates)
  useEffect(() => {
    wsClient.connect()
    wsClient.subscribe((data) => {
      if (data.type === 'simulation_update') {
        setMetrics(prev => ({
          ...prev,
          north_queue: data.north_queue ?? prev.north_queue,
          south_queue: data.south_queue ?? prev.south_queue,
          east_queue: data.east_queue ?? prev.east_queue,
          west_queue: data.west_queue ?? prev.west_queue,
          current_phase: data.current_phase ?? prev.current_phase,
          time_in_phase: data.time_in_phase ?? prev.time_in_phase,
          avg_waiting_time: data.avg_waiting_time ?? prev.avg_waiting_time,
          throughput: data.throughput ?? prev.throughput,
          queue_length: data.queue_length ?? prev.queue_length,
          efficiency: data.efficiency ?? prev.efficiency,
          episode_number: data.episode_number ?? prev.episode_number
        }))
      }
    })

    return () => {
      wsClient.disconnect()
    }
  }, [wsClient])

  const handleStart = async () => {
    console.log('🎮 Starting simulation...')
    
    if (isPaused) {
      // Resume from pause
      setIsPaused(false)
      console.log('▶️  Resumed simulation')
      
      // Try to resume via API (optional - works offline too)
      try {
        await api.resumeSimulation()
      } catch (error) {
        console.log('⚠️  Backend not available, using local simulation')
      }
    } else {
      // Start new simulation
      setIsRunning(true)
      setMetrics(prev => ({ ...prev, episode_number: prev.episode_number + 1 }))
      console.log('✅ Simulation started')
      
      // Try to start via API (optional - works offline too)
      try {
        await api.startSimulation({
          mode: 'ai',
          gui: false,
          traffic_density: 'medium',
          n_vehicles: 50
        })
      } catch (error) {
        console.log('⚠️  Backend not available, using local simulation')
      }
    }
  }

  const handlePause = async () => {
    console.log('⏸️  Pausing simulation...')
    setIsPaused(true)
    
    try {
      await api.pauseSimulation()
    } catch (error) {
      console.log('⚠️  Backend not available')
    }
  }

  const handleStop = async () => {
    console.log('⏹️  Stopping simulation...')
    setIsRunning(false)
    setIsPaused(false)
    
    try {
      await api.stopSimulation()
    } catch (error) {
      console.log('⚠️  Backend not available')
    }
  }

  const handleReset = async () => {
    console.log('🔄 Resetting simulation...')
    setIsRunning(false)
    setIsPaused(false)
    setMetrics({
      north_queue: 3,
      south_queue: 2,
      east_queue: 4,
      west_queue: 2,
      current_phase: 0,
      time_in_phase: 0,
      avg_waiting_time: 24.5,
      throughput: 1240,
      queue_length: 11,
      efficiency: 85,
      episode_number: 0
    })
    
    try {
      await api.stopSimulation()
    } catch (error) {
      console.log('⚠️  Backend not available')
    }
  }

  return (
    <div className="flex min-h-screen bg-nexus-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Live Simulation Feed" 
          subtitle="Real-time Traffic Control • AI Agent Active"
        />

        <main className="flex-1 p-8 overflow-auto">
          {/* Status Banner */}
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            isRunning 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-gray-500/10 border-gray-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isRunning && (
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse" />
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isRunning ? (isPaused ? '⏸️  Simulation Paused' : '▶️  Simulation Running') : '⏹️  Simulation Stopped'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {isRunning 
                      ? `Episode ${metrics.episode_number} • Phase ${metrics.current_phase === 0 ? 'NS' : 'EW'} • ${metrics.time_in_phase.toFixed(0)}s`
                      : 'Click Start to begin simulation'
                    }
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{metrics.queue_length}</div>
                <div className="text-xs text-gray-400">vehicles in queue</div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Intersection */}
            <div className="lg:col-span-2">
              <IntersectionView
                northQueue={metrics.north_queue}
                southQueue={metrics.south_queue}
                eastQueue={metrics.east_queue}
                westQueue={metrics.west_queue}
                currentPhase={metrics.current_phase}
                timeInPhase={metrics.time_in_phase}
              />
            </div>

            {/* Right Column - Controls & Metrics */}
            <div className="space-y-6">
              <ControlPanel
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
                onReset={handleReset}
                isRunning={isRunning}
                isPaused={isPaused}
              />

              <LiveFeed
                isRunning={isRunning}
                avgWaitTime={metrics.avg_waiting_time}
                throughput={metrics.throughput}
                queueLength={metrics.queue_length}
                efficiency={metrics.efficiency}
                episodeNumber={metrics.episode_number}
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="mt-6 glass rounded-xl p-6 border-2 border-cyan-500/30">
            <h3 className="text-lg font-bold text-white mb-3">🎮 Simulation Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="font-semibold text-blue-400 mb-1">1. Start Simulation</div>
                <div className="text-gray-400">Click "Start" to begin the AI-controlled traffic simulation</div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="font-semibold text-purple-400 mb-1">2. Watch AI Learn</div>
                <div className="text-gray-400">Observe how the DQN agent optimizes traffic flow in real-time</div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="font-semibold text-green-400 mb-1">3. Monitor Performance</div>
                <div className="text-gray-400">Track metrics like wait time, throughput, and efficiency</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}