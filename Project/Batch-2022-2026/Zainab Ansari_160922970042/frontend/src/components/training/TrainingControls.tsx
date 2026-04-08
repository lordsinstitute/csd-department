'use client'

import { Play, Pause, Square, RotateCcw } from 'lucide-react'

interface TrainingControlsProps {
  isTraining: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export default function TrainingControls({
  isTraining,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop
}: TrainingControlsProps) {
  return (
    <div className="glass rounded-xl p-6 border-2 border-cyan-500/30">
      <h3 className="text-lg font-bold text-white mb-4">Training Controls</h3>
      
      <div className="flex gap-3">
        {!isTraining ? (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Training
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={onPause}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Resume
              </button>
            )}
            
            <button
              onClick={onStop}
              className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg transition-all shadow-lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </button>
          </>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Status</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isTraining ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm font-semibold text-white">
              {isTraining ? (isPaused ? 'Paused' : 'Training...') : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}