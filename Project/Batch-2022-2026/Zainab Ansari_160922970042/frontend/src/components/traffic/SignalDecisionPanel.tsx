'use client'

import { Signal, TrendingUp, Zap, CheckCircle } from 'lucide-react'

interface SignalDecisionPanelProps {
  decision: {
    decision: string
    confidence: number
    policy: string
    state: {
      north_queue: number
      south_queue: number
      east_queue: number
      west_queue: number
      current_phase: string
      time_in_phase: number
      emergency_active: boolean
    }
    reasons: string[]
    congestion_level: string
    priority_direction: string
    estimated_wait_reduction: string
  } | null
}

export default function SignalDecisionPanel({ decision }: SignalDecisionPanelProps) {
  if (!decision) {
    return (
      <div className="glass rounded-xl p-6 border-2 border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Signal className="w-5 h-5 mr-2 text-cyan-400" />
          AI Signal Decision
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🤖</div>
          <div className="text-gray-400">Waiting for traffic data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6 border-2 border-cyan-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Signal className="w-5 h-5 mr-2 text-cyan-400" />
          AI Signal Decision
        </h3>
        <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-400 font-semibold">
          {decision.policy}
        </div>
      </div>

      {/* Decision Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border-2 border-cyan-500">
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold text-white">{decision.decision}</div>
          <div className="text-xl font-bold text-green-400">{decision.confidence}%</div>
        </div>
        <div className="text-sm text-gray-400">Confidence Score</div>
      </div>

      {/* Queue Status */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-gray-400 mb-3">Lane Queues</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="text-xs text-gray-400">⬆️ North</div>
            <div className="text-xl font-bold text-white">{decision.state.north_queue}</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-xs text-gray-400">⬇️ South</div>
            <div className="text-xl font-bold text-white">{decision.state.south_queue}</div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="text-xs text-gray-400">➡️ East</div>
            <div className="text-xl font-bold text-white">{decision.state.east_queue}</div>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <div className="text-xs text-gray-400">⬅️ West</div>
            <div className="text-xl font-bold text-white">{decision.state.west_queue}</div>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Decision Rationale
        </div>
        <div className="space-y-2">
          {decision.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-800/50 rounded">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-800/30 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Priority Direction</div>
          <div className="text-sm font-semibold text-white">{decision.priority_direction}</div>
        </div>
        <div className="p-3 bg-gray-800/30 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Est. Wait Reduction</div>
          <div className="text-sm font-semibold text-green-400">{decision.estimated_wait_reduction}</div>
        </div>
      </div>

      {/* Congestion Level */}
      <div className="mt-4 p-3 rounded-lg border-2" style={{
        borderColor: decision.congestion_level === 'High' ? '#ef4444' : 
                     decision.congestion_level === 'Medium' ? '#f59e0b' : '#10b981',
        backgroundColor: decision.congestion_level === 'High' ? 'rgba(239, 68, 68, 0.1)' : 
                         decision.congestion_level === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 
                         'rgba(16, 185, 129, 0.1)'
      }}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Congestion Level</span>
          <span className="font-bold text-white">{decision.congestion_level}</span>
        </div>
      </div>

      {/* Emergency Alert */}
      {decision.state.emergency_active && (
        <div className="mt-4 p-3 bg-red-500/20 border-2 border-red-500 rounded-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
            <span className="text-sm font-bold text-red-400">🚨 EMERGENCY VEHICLE PRIORITY</span>
          </div>
        </div>
      )}
    </div>
  )
}