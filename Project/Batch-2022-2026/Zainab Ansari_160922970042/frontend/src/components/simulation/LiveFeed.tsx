// frontend/src/components/simulation/LiveFeed.tsx

'use client'

import React from 'react'
import { Activity, Clock, Users, TrendingUp, Zap } from 'lucide-react'

interface LiveFeedProps {
  isRunning?: boolean
  avgWaitTime?: number
  throughput?: number
  queueLength?: number
  efficiency?: number
  episodeNumber?: number
}

export const LiveFeed: React.FC<LiveFeedProps> = ({
  isRunning = false,
  avgWaitTime = 24.5,
  throughput = 1240,
  queueLength = 8,
  efficiency = 85,
  episodeNumber = 0
}) => {
  return (
    <div className="glass rounded-xl p-6 border-2 border-cyan-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-cyan-400" />
          Live Metrics
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isRunning 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {isRunning ? (
            <>
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              ACTIVE
            </>
          ) : (
            'STOPPED'
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Average Wait Time */}
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-orange-400 mr-2" />
              <span className="text-sm text-gray-300">Avg Wait Time</span>
            </div>
            <span className="text-2xl font-bold text-white">{avgWaitTime.toFixed(1)}s</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((avgWaitTime / 60) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Throughput */}
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm text-gray-300">Throughput</span>
            </div>
            <span className="text-2xl font-bold text-white">{throughput}</span>
          </div>
          <div className="text-xs text-gray-400">vehicles/hour</div>
        </div>

        {/* Queue Length */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-purple-400 mr-2" />
              <span className="text-sm text-gray-300">Queue Length</span>
            </div>
            <span className="text-2xl font-bold text-white">{queueLength}</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((queueLength / 20) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Efficiency */}
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Zap className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-sm text-gray-300">Efficiency</span>
            </div>
            <span className="text-2xl font-bold text-white">{efficiency}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${efficiency}%` }}
            />
          </div>
        </div>
      </div>

      {episodeNumber > 0 && (
        <div className="mt-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="text-xs text-gray-400">Current Episode</div>
          <div className="text-lg font-bold text-cyan-400">#{episodeNumber}</div>
        </div>
      )}
    </div>
  )
}

export default LiveFeed