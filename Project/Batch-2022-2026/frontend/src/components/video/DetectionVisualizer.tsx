'use client'

import React from 'react'
import { VehicleDetection, DetectionStatistics } from '@/types/detection.types'
import { VideoProcessingUtils } from '@/lib/videoProcessing'

interface DetectionVisualizerProps {
  detections: VehicleDetection[]
  statistics: DetectionStatistics
}

export const DetectionVisualizer: React.FC<DetectionVisualizerProps> = ({
  detections = [],
  statistics
}) => {

  const safeStats = statistics || {
    total: 0,
    cars: 0,
    motorcycles: 0,
    buses: 0,
    trucks: 0,
    avg_confidence: 0
  }

  return (
    <div className="glass rounded-xl p-6 border-2 border-purple-500/30">

      <h3 className="text-lg font-bold text-white mb-4">
        🎯 YOLOv8 Detections
      </h3>

      {/* Statistics Summary */}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">

        <StatCard
          label="Total Vehicles"
          value={safeStats.total}
          emoji="🚗"
          color="blue"
        />

        <StatCard
          label="Cars"
          value={safeStats.cars}
          emoji="🚗"
          color="green"
        />

        <StatCard
          label="Motorcycles"
          value={safeStats.motorcycles}
          emoji="🏍️"
          color="pink"
        />

        <StatCard
          label="Buses"
          value={safeStats.buses}
          emoji="🚌"
          color="red"
        />

        <StatCard
          label="Trucks"
          value={safeStats.trucks}
          emoji="🚚"
          color="yellow"
        />

        <StatCard
          label="Avg Confidence"
          value={`${(safeStats.avg_confidence * 100).toFixed(1)}%`}
          emoji="📊"
          color="purple"
        />

      </div>

      {/* Detection List */}

      <div className="space-y-2">

        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Recent Detections</span>
          <span>{detections.length} detected</span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">

          {detections.length === 0 ? (

            <div className="text-center text-gray-500 py-8">
              No vehicles detected in current frame
            </div>

          ) : (

            detections.slice(0, 10).map((det, idx) => {

              const color = VideoProcessingUtils.getVehicleColor(det.class)

              return (
                <div
                  key={`${det.class}-${idx}`}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 transition-colors"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center space-x-3">

                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        style={{
                          backgroundColor: color + '20',
                          border: `2px solid ${color}`
                        }}
                      >
                        {VideoProcessingUtils.getVehicleIcon(det.class)}
                      </div>

                      <div>
                        <div className="text-white font-semibold capitalize">
                          {det.class}
                        </div>

                        <div className="text-xs text-gray-400">
                          Position: ({det.center?.[0] ?? 0}, {det.center?.[1] ?? 0})
                        </div>
                      </div>

                    </div>

                    <div className="text-right">

                      <div
                        className="text-lg font-bold"
                        style={{ color }}
                      >
                        {(det.confidence * 100).toFixed(0)}%
                      </div>

                      <div className="text-xs text-gray-500">
                        confidence
                      </div>

                    </div>

                  </div>

                </div>
              )
            })

          )}

        </div>

      </div>

      {/* Detection Quality Indicator */}

      <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">

        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-2">

            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />

            <span className="text-sm text-cyan-400 font-semibold">
              YOLOv8 Detection Active
            </span>

          </div>

          <div className="text-xs text-gray-400">
            Model: yolov8n.pt
          </div>

        </div>

      </div>

    </div>
  )
}

export default DetectionVisualizer



function StatCard({
  label,
  value,
  emoji,
  color
}: {
  label: string
  value: string | number
  emoji: string
  color: string
}) {

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/30",
    green: "from-green-500/10 to-emerald-500/10 border-green-500/30",
    pink: "from-pink-500/10 to-purple-500/10 border-pink-500/30",
    red: "from-red-500/10 to-orange-500/10 border-red-500/30",
    yellow: "from-yellow-500/10 to-amber-500/10 border-yellow-500/30",
    purple: "from-purple-500/10 to-indigo-500/10 border-purple-500/30"
  }

  return (
    <div className={`p-4 bg-gradient-to-br ${colorMap[color]} rounded-lg border`}>

      <div className="flex items-center justify-between mb-2">

        <span className="text-sm text-gray-400">
          {label}
        </span>

        <span className="text-2xl">
          {emoji}
        </span>

      </div>

      <div className="text-3xl font-bold text-white">
        {value}
      </div>

    </div>
  )
}