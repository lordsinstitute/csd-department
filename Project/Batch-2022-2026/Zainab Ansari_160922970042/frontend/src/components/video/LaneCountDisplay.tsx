// frontend/src/components/video/LaneCountDisplay.tsx

'use client'

import React from 'react'
import { LaneCounts } from '@/types/detection.types'
import { VideoProcessingUtils } from '@/lib/videoProcessing'

interface LaneCountDisplayProps {
  laneCounts: LaneCounts;
  currentPhase: number;
}

export const LaneCountDisplay: React.FC<LaneCountDisplayProps> = ({
  laneCounts,
  currentPhase
}) => {
  const totalVehicles = VideoProcessingUtils.getTotalVehicles(laneCounts)
  const congestionLevel = VideoProcessingUtils.getCongestionLevel(laneCounts)
  const congestionInfo = VideoProcessingUtils.getCongestionStatus(congestionLevel)

  // Get active lanes based on signal phase
  const activeLanes = currentPhase === 0 ? ['north', 'south'] : ['east', 'west']

  return (
    <div className="glass rounded-xl p-6 border-2 border-green-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          🚦 Lane-wise Vehicle Count
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          congestionInfo.status === 'Low' ? 'bg-green-500/20 text-green-400' :
          congestionInfo.status === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
          congestionInfo.status === 'High' ? 'bg-orange-500/20 text-orange-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {congestionInfo.status} Congestion
        </div>
      </div>

      {/* Total Vehicles */}
      <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Total Vehicles</div>
            <div className="text-3xl font-bold text-white">{totalVehicles}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Congestion Level</div>
            <div className="text-2xl font-bold text-cyan-400">{congestionLevel}%</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                congestionLevel < 30 ? 'bg-green-500' :
                congestionLevel < 60 ? 'bg-yellow-500' :
                congestionLevel < 85 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${congestionLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lane Counts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* North Lane */}
        <div className={`p-4 rounded-lg border-2 transition-all ${
          activeLanes.includes('north')
            ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/50'
            : 'bg-gray-800/30 border-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⬆️</div>
              <span className="text-sm font-semibold text-gray-300">NORTH</span>
            </div>
            {activeLanes.includes('north') && (
              <div className="px-2 py-1 bg-green-500 rounded text-xs font-bold text-white">
                GREEN
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-white">{laneCounts.north}</div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(laneCounts.north / 20) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Est. wait: {VideoProcessingUtils.estimateWaitTime(
              laneCounts.north, 
              currentPhase, 
              0
            )}s
          </div>
        </div>

        {/* South Lane */}
        <div className={`p-4 rounded-lg border-2 transition-all ${
          activeLanes.includes('south')
            ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/50'
            : 'bg-gray-800/30 border-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⬇️</div>
              <span className="text-sm font-semibold text-gray-300">SOUTH</span>
            </div>
            {activeLanes.includes('south') && (
              <div className="px-2 py-1 bg-green-500 rounded text-xs font-bold text-white">
                GREEN
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-white">{laneCounts.south}</div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(laneCounts.south / 20) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Est. wait: {VideoProcessingUtils.estimateWaitTime(
              laneCounts.south, 
              currentPhase, 
              0
            )}s
          </div>
        </div>

        {/* East Lane */}
        <div className={`p-4 rounded-lg border-2 transition-all ${
          activeLanes.includes('east')
            ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/50'
            : 'bg-gray-800/30 border-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">➡️</div>
              <span className="text-sm font-semibold text-gray-300">EAST</span>
            </div>
            {activeLanes.includes('east') && (
              <div className="px-2 py-1 bg-green-500 rounded text-xs font-bold text-white">
                GREEN
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-white">{laneCounts.east}</div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${(laneCounts.east / 20) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Est. wait: {VideoProcessingUtils.estimateWaitTime(
              laneCounts.east, 
              currentPhase, 
              0
            )}s
          </div>
        </div>

        {/* West Lane */}
        <div className={`p-4 rounded-lg border-2 transition-all ${
          activeLanes.includes('west')
            ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/50'
            : 'bg-gray-800/30 border-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⬅️</div>
              <span className="text-sm font-semibold text-gray-300">WEST</span>
            </div>
            {activeLanes.includes('west') && (
              <div className="px-2 py-1 bg-green-500 rounded text-xs font-bold text-white">
                GREEN
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-white">{laneCounts.west}</div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${(laneCounts.west / 20) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Est. wait: {VideoProcessingUtils.estimateWaitTime(
              laneCounts.west, 
              currentPhase, 
              0
            )}s
          </div>
        </div>
      </div>

      {/* Current Phase Indicator */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Current Phase</span>
          </div>
          <div className="text-lg font-bold text-white">
            {VideoProcessingUtils.getSignalPhaseName(currentPhase)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LaneCountDisplay