'use client'

import { Brain, TrendingUp, Zap, AlertCircle } from 'lucide-react'

interface AIDecisionExplainerProps {
  decision: {
    action?: string
    confidence?: number
    state?: {
      north_queue?: number
      south_queue?: number
      east_queue?: number
      west_queue?: number
      current_phase?: string
      emergency_active?: boolean
    }
    reasons?: string[]
    q_values?: {
      NS_GREEN?: number
      EW_GREEN?: number
    }
    policy?: string
    priority_direction?: string
    estimated_wait_reduction?: string
  } | null
}

export default function AIDecisionExplainer({ decision }: AIDecisionExplainerProps) {

  if (!decision) {
    return (
      <div className="glass rounded-xl p-6 border-2 border-purple-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          AI Decision Explainer
        </h3>

        <div className="text-center py-8">
          <div className="text-4xl mb-3">🤖</div>
          <div className="text-gray-400">Waiting for traffic data...</div>
        </div>
      </div>
    )
  }

  const north = decision.state?.north_queue ?? 0
  const south = decision.state?.south_queue ?? 0
  const east = decision.state?.east_queue ?? 0
  const west = decision.state?.west_queue ?? 0

  const maxQueue = Math.max(north, south, east, west)

  const confidence = decision.confidence ?? 0

  return (

    <div className="glass rounded-xl p-6 border-2 border-purple-500/30">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <h3 className="text-lg font-bold text-white flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          AI Decision Explainer
        </h3>

        <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-xs text-purple-400 font-semibold">
          {decision.policy ?? "DQN Reinforcement Learning"}
        </div>

      </div>

      {/* Decision */}

      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border-2 border-purple-500">

        <div className="flex items-center justify-between mb-3">

          <div>

            <div className="text-sm text-gray-400 mb-1">
              AI SIGNAL DECISION
            </div>

            <div className="text-2xl font-bold text-white">
              {decision.action ?? "Processing"}
            </div>

          </div>

          <div className="text-right">

            <div className="text-sm text-gray-400 mb-1">
              Confidence
            </div>

            <div className="text-3xl font-bold text-green-400">
              {confidence}%
            </div>

          </div>

        </div>

        {/* Confidence bar */}

        <div className="w-full bg-gray-800 rounded-full h-2">

          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${confidence}%` }}
          />

        </div>

      </div>

      {/* Queue Status */}

      <div className="mb-6">

        <div className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Lane Queues
        </div>

        <div className="grid grid-cols-2 gap-3">

          <QueueCard direction="⬆️ North" count={north} maxQueue={maxQueue} color="blue" />

          <QueueCard direction="⬇️ South" count={south} maxQueue={maxQueue} color="green" />

          <QueueCard direction="➡️ East" count={east} maxQueue={maxQueue} color="purple" />

          <QueueCard direction="⬅️ West" count={west} maxQueue={maxQueue} color="orange" />

        </div>

      </div>

      {/* Q Values */}

      <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">

        <div className="text-sm font-semibold text-gray-400 mb-3">
          Q-Value Analysis
        </div>

        <div className="space-y-3">

          <QValue
            label="NS GREEN"
            value={decision.q_values?.NS_GREEN ?? 0}
            color="cyan"
          />

          <QValue
            label="EW GREEN"
            value={decision.q_values?.EW_GREEN ?? 0}
            color="orange"
          />

        </div>

      </div>

      {/* Reasons */}

      <div className="mb-6">

        <div className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Decision Rationale
        </div>

        <div className="space-y-2">

          {(decision.reasons ?? []).map((reason, idx) => (

            <div
              key={idx}
              className="flex items-start space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30"
            >

              <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>

              <span className="text-sm text-gray-300">
                {reason}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Metrics */}

      <div className="grid grid-cols-2 gap-3">

        <Metric
          label="Priority Direction"
          value={decision.priority_direction ?? "None"}
        />

        <Metric
          label="Wait Reduction"
          value={decision.estimated_wait_reduction ?? "0s"}
        />

      </div>

      {/* Emergency */}

      {decision.state?.emergency_active && (

        <div className="mt-4 p-3 bg-red-500/20 border-2 border-red-500 rounded-lg animate-pulse">

          <div className="flex items-center space-x-2">

            <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />

            <span className="text-sm font-bold text-red-400">
              🚨 EMERGENCY VEHICLE PRIORITY ACTIVE
            </span>

          </div>

        </div>

      )}

    </div>

  )

}

function QueueCard({ direction, count, maxQueue, color }: any) {

  const percentage = maxQueue > 0 ? (count / maxQueue) * 100 : 0

  return (

    <div className="p-3 rounded-lg border border-gray-700 bg-gray-800/30">

      <div className="text-xs text-gray-400 mb-1">
        {direction}
      </div>

      <div className="text-2xl font-bold text-white mb-2">
        {count}
      </div>

      <div className="w-full bg-gray-700 rounded-full h-1.5">

        <div
          className="h-1.5 rounded-full bg-purple-500"
          style={{ width: `${percentage}%` }}
        />

      </div>

    </div>

  )

}

function QValue({ label, value, color }: any) {

  return (

    <div>

      <div className="flex justify-between text-sm mb-1">

        <span className="text-gray-300">
          {label}
        </span>

        <span className="font-bold text-white">
          {value.toFixed(3)}
        </span>

      </div>

      <div className="w-full bg-gray-700 rounded-full h-2">

        <div
          className="h-2 rounded-full bg-purple-500"
          style={{ width: `${Math.min(100, value * 10)}%` }}
        />

      </div>

    </div>

  )

}

function Metric({ label, value }: any) {

  return (

    <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700">

      <div className="text-xs text-gray-400">
        {label}
      </div>

      <div className="text-sm font-bold text-white">
        {value}
      </div>

    </div>

  )

}