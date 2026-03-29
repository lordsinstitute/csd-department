'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import TrainingControls from '@/components/training/TrainingControls'
import LiveCharts from '@/components/training/LiveCharts'
import { useWebSocket } from '@/lib/useWebSocket'
import { Activity, Zap, TrendingUp, Database, Clock, Cpu, Award } from 'lucide-react'

export default function TrainingConsolePage() {

  const [isTraining, setIsTraining] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const [currentMetrics, setCurrentMetrics] = useState({
    episode: 0,
    reward: 0,
    loss: 0,
    epsilon: 1.0,
    replay_memory_size: 0,
    training_time: 0
  })

  const [historyData, setHistoryData] = useState({
    episodes: [] as number[],
    rewards: [] as number[],
    losses: [] as number[],
    epsilon: [] as number[]
  })

  const [trainingStats, setTrainingStats] = useState({
    totalEpisodes: 0,
    avgReward: 0,
    bestReward: 0,
    avgLoss: 0,
    learningRate: 0.001
  })

  const { lastMessage, isConnected } = useWebSocket()
  const statsUpdateRef = useRef(false)

  useEffect(() => {
    if (lastMessage?.type === 'training_update') {

      const data = lastMessage.data
      setCurrentMetrics(data)

      setHistoryData(prev => {

        const newData = {
          episodes: [...prev.episodes, data.episode].slice(-100),
          rewards: [...prev.rewards, data.reward].slice(-100),
          losses: [...prev.losses, data.loss].slice(-100),
          epsilon: [...prev.epsilon, data.epsilon].slice(-100)
        }

        if (!statsUpdateRef.current) {

          statsUpdateRef.current = true

          setTimeout(() => {

            setTrainingStats({
              totalEpisodes: data.episode,
              avgReward:
                newData.rewards.length > 0
                  ? newData.rewards.reduce((a, b) => a + b, 0) / newData.rewards.length
                  : 0,
              bestReward:
                newData.rewards.length > 0
                  ? Math.max(...newData.rewards)
                  : 0,
              avgLoss:
                newData.losses.length > 0
                  ? newData.losses.reduce((a, b) => a + b, 0) / newData.losses.length
                  : 0,
              learningRate: 0.001
            })

            statsUpdateRef.current = false

          }, 100)
        }

        return newData
      })
    }

  }, [lastMessage])


  async function handleStart() {

    try {

      const response = await fetch(
        'http://localhost:8000/api/training/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ num_episodes: 100 })
        }
      )

      if (response.ok) {
        setIsTraining(true)
        setIsPaused(false)
      }

    } catch (error) {
      console.error(error)
    }
  }


  async function handlePause() {

    try {

      await fetch(
        'http://localhost:8000/api/training/pause',
        { method: 'POST' }
      )

      setIsPaused(true)

    } catch (error) {
      console.error(error)
    }
  }


  async function handleResume() {

    try {

      await fetch(
        'http://localhost:8000/api/training/resume',
        { method: 'POST' }
      )

      setIsPaused(false)

    } catch (error) {
      console.error(error)
    }
  }


  async function handleStop() {

    try {

      await fetch(
        'http://localhost:8000/api/training/stop',
        { method: 'POST' }
      )

      setIsTraining(false)
      setIsPaused(false)

    } catch (error) {
      console.error(error)
    }
  }


  return (

    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header
          title="RL Training Console"
          subtitle="Deep Q-Network Training Interface"
        />

        <main className="flex-1 p-8 overflow-auto">

          {/* WebSocket Status */}

          <div className="mb-6 glass rounded-xl p-4 border-2 border-cyan-500/30">

            <div className="flex items-center justify-between">

              <div className="flex items-center space-x-3">

                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-red-400'
                  }`}
                />

                <span className="text-sm font-semibold text-white">
                  WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
                </span>

              </div>

              <div className="text-xs text-gray-400">
                Real-time training updates
              </div>

            </div>

          </div>


          {/* Training Controls */}

          <div className="mb-8">

            <TrainingControls
              isTraining={isTraining}
              isPaused={isPaused}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
            />

          </div>


          {/* Metrics */}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">

            <MetricCard
              icon={<Activity className="w-6 h-6 text-blue-400" />}
              title="Current Episode"
              value={currentMetrics.episode}
              color="blue"
            />

            <MetricCard
              icon={<TrendingUp className="w-6 h-6 text-green-400" />}
              title="Episode Reward"
              value={currentMetrics.reward.toFixed(2)}
              subtitle={`Best: ${trainingStats.bestReward.toFixed(2)}`}
              color="green"
            />

            <MetricCard
              icon={<Zap className="w-6 h-6 text-red-400" />}
              title="Training Loss"
              value={currentMetrics.loss.toFixed(4)}
              subtitle={`Avg: ${trainingStats.avgLoss.toFixed(4)}`}
              color="red"
            />

            <MetricCard
              icon={<Database className="w-6 h-6 text-purple-400" />}
              title="Epsilon"
              value={currentMetrics.epsilon.toFixed(3)}
              color="purple"
            />

          </div>


          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            <StatCard
              icon={<Database className="w-5 h-5 text-cyan-400" />}
              label="Replay Memory"
              value={currentMetrics.replay_memory_size}
              maxValue={10000}
            />

            <StatCard
              icon={<Clock className="w-5 h-5 text-orange-400" />}
              label="Training Time"
              value={`${currentMetrics.training_time}s`}
            />

            <StatCard
              icon={<Cpu className="w-5 h-5 text-pink-400" />}
              label="Learning Rate"
              value={trainingStats.learningRate.toFixed(4)}
            />

            <StatCard
              icon={<Award className="w-5 h-5 text-yellow-400" />}
              label="Total Episodes"
              value={trainingStats.totalEpisodes}
            />

          </div>


          {/* Charts */}

          <LiveCharts data={historyData} />

        </main>

      </div>

    </div>
  )
}


function MetricCard({
  icon,
  title,
  value,
  subtitle,
  color
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  color: string
}) {

  return (

    <div className="glass rounded-xl p-6 border border-gray-700">

      <div className="flex justify-between items-center mb-2">
        {icon}
        <div className="text-3xl font-bold text-white">
          {value}
        </div>
      </div>

      <div className="text-sm text-gray-400">
        {title}
      </div>

      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">
          {subtitle}
        </div>
      )}

    </div>
  )
}


function StatCard({
  icon,
  label,
  value,
  maxValue
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  maxValue?: number
}) {

  const percentage =
    maxValue && typeof value === 'number'
      ? (value / maxValue) * 100
      : 0

  return (

    <div className="glass rounded-xl p-6 border border-gray-700">

      <div className="flex justify-between items-center mb-3">
        {icon}
        <span className="text-xl font-bold text-white">
          {value}
        </span>
      </div>

      <div className="text-sm text-gray-400 mb-2">
        {label}
      </div>

      {maxValue && typeof value === 'number' && (

        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">

          <div
            className="h-full bg-cyan-400"
            style={{ width: `${percentage}%` }}
          />

        </div>

      )}

    </div>
  )
}