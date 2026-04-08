// frontend/src/components/simulation/ControlPanel.tsx

'use client'

import React, { useState } from 'react'
import { Play, Pause, Square, RotateCcw, Settings } from 'lucide-react'

interface ControlPanelProps {
  onStart?: () => void
  onPause?: () => void
  onStop?: () => void
  onReset?: () => void
  isRunning?: boolean
  isPaused?: boolean
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onStart,
  onPause,
  onStop,
  onReset,
  isRunning = false,
  isPaused = false
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [speed, setSpeed] = useState(1)

  return (
    <div className="glass rounded-xl p-6 border-2 border-cyan-500/30">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-cyan-400" />
        Simulation Controls
      </h3>

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/50"
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </button>
        ) : isPaused ? (
          <button
            onClick={onStart}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/50"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-yellow-500/50"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </button>
        )}

        <button
          onClick={onStop}
          disabled={!isRunning}
          className={`flex items-center justify-center px-4 py-3 font-semibold rounded-lg transition-all ${
            isRunning
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Square className="w-4 h-4 mr-2" />
          Stop
        </button>

        <button
          onClick={onReset}
          className="col-span-2 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Simulation
        </button>
      </div>

      {/* Speed Control */}
      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Simulation Speed</span>
          <span className="text-sm font-bold text-cyan-400">{speed}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((speed - 0.5) / 2.5) * 100}%, #374151 ${((speed - 0.5) / 2.5) * 100}%, #374151 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.5x</span>
          <span>1x</span>
          <span>2x</span>
          <span>3x</span>
        </div>
      </div>

      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full mt-4 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/30"
      >
        {showSettings ? '▲ Hide' : '▼ Show'} Advanced Settings
      </button>

      {showSettings && (
        <div className="mt-4 space-y-3 p-4 bg-gray-700/20 rounded-lg border border-gray-600/30">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Traffic Density</label>
            <select className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Rush Hour</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Vehicle Types</label>
            <div className="flex gap-2">
              <label className="flex items-center text-sm text-gray-300">
                <input type="checkbox" defaultChecked className="mr-2" />
                Cars
              </label>
              <label className="flex items-center text-sm text-gray-300">
                <input type="checkbox" defaultChecked className="mr-2" />
                Buses
              </label>
              <label className="flex items-center text-sm text-gray-300">
                <input type="checkbox" className="mr-2" />
                Trucks
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ControlPanel