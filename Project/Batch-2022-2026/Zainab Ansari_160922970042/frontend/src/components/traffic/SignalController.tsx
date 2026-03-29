// frontend/src/components/traffic/SignalController.tsx

'use client'

import React from 'react'
import { Signal, Zap, AlertTriangle } from 'lucide-react'  // ✅ CHANGED
import { VideoProcessingUtils } from '@/lib/videoProcessing'

interface SignalControllerProps {
  currentPhase: number;
  timeInPhase: number;
  dqnAction: number;
  qValues?: number[];
}

export const SignalController: React.FC<SignalControllerProps> = ({
  currentPhase,
  timeInPhase,
  dqnAction,
  qValues = [0, 0]
}) => {
  const phaseName = VideoProcessingUtils.getSignalPhaseName(currentPhase)
  const actionDescription = VideoProcessingUtils.getActionDescription(dqnAction, currentPhase)
  const timeFormatted = VideoProcessingUtils.formatTimeInPhase(timeInPhase)

  return (
    <div className="glass rounded-xl p-6 border-2 border-yellow-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Signal className="w-5 h-5 mr-2 text-yellow-400" />  {/* ✅ CHANGED */}
          Signal Controller
        </h3>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-cyan-400 font-semibold">DQN Active</span>
        </div>
      </div>

      {/* Current Signal Phase */}
      <div className="mb-6">
        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/30">
          <div className="text-sm text-gray-400 mb-1">Current Signal Phase</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">{phaseName}</div>
            <div className="flex space-x-2">
              <div className="flex flex-col space-y-1">
                <div className={`w-6 h-6 rounded-full ${
                  currentPhase === 0 ? 'bg-red-500 animate-pulse' : 'bg-red-900'
                }`} />
                <div className="w-6 h-6 rounded-full bg-yellow-900" />
                <div className={`w-6 h-6 rounded-full ${
                  currentPhase === 0 ? 'bg-green-900' : 'bg-green-500 animate-pulse'
                }`} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">Time in phase:</span>
            <span className="text-cyan-400 font-semibold">{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* DQN Decision */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">DQN Agent Decision</div>
        <div className={`p-4 rounded-lg border-2 ${
          dqnAction === 1 
            ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/30' 
            : 'bg-blue-500/10 border-blue-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold text-white">
              {dqnAction === 0 ? '✋ KEEP' : '🔄 SWITCH'}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              dqnAction === 1 
                ? 'bg-orange-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              Action: {dqnAction}
            </div>
          </div>
          <div className="text-sm text-gray-300">{actionDescription}</div>
        </div>
      </div>

      {/* Q-Values */}
      {qValues && (
        <div>
          <div className="text-sm text-gray-400 mb-2">Q-Values (Neural Network Output)</div>
          <div className="space-y-2">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Keep Current Signal</span>
                <span className="text-lg font-bold text-blue-400">
                  {qValues[0]?.toFixed(3) || '0.000'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(Math.abs(qValues[0] || 0) * 10, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Switch Signal</span>
                <span className="text-lg font-bold text-orange-400">
                  {qValues[1]?.toFixed(3) || '0.000'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(Math.abs(qValues[1] || 0) * 10, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Decision Confidence:</span>
              <span className="text-cyan-400 font-semibold">
                {(Math.abs(qValues[1] - qValues[0]) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Warning for Emergency */}
      <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-400">
            Emergency vehicles get automatic priority override
          </span>
        </div>
      </div>
    </div>
  )
}

export default SignalController