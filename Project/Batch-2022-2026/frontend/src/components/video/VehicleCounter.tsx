// frontend/src/components/video/VehicleCounter.tsx

/**
 * Vehicle Counter Component
 * Displays real-time vehicle counts for each lane with visual indicators
 */

import React from 'react';
import { LaneCounts, DetectionStatistics, OperationMode } from '@/types/video.types';
import { Car, Bike, Bus, Truck, Activity } from 'lucide-react';

interface VehicleCounterProps {
  laneCounts: LaneCounts;
  statistics?: DetectionStatistics;
  mode?: OperationMode;
}

export const VehicleCounter: React.FC<VehicleCounterProps> = ({
  laneCounts,
  statistics,
  mode = 'video',
}) => {
  const totalVehicles = 
    laneCounts.north + 
    laneCounts.south + 
    laneCounts.east + 
    laneCounts.west;

  const getLaneColor = (count: number): string => {
    if (count >= 10) return 'text-red-400 bg-red-500/20';
    if (count >= 5) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getLaneBarWidth = (count: number): string => {
    const maxCount = 15; // Maximum expected per lane
    const percentage = Math.min((count / maxCount) * 100, 100);
    return `${percentage}%`;
  };

  const getLaneBarColor = (count: number): string => {
    if (count >= 10) return 'bg-gradient-to-r from-red-500 to-red-400';
    if (count >= 5) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-green-500 to-green-400';
  };

  return (
    <div className="glass rounded-xl p-6 border-2 border-emerald-500/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-emerald-400" />
          Vehicle Count
        </h3>
        <span className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${mode === 'video' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}
        `}>
          {mode === 'video' ? '🎥 Real Video' : '🎮 Simulation'}
        </span>
      </div>

      {/* Total Count Card */}
      <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
        <div className="text-center">
          <p className="text-sm text-cyan-300 mb-1">Total Vehicles</p>
          <p className="text-4xl font-bold text-white">{totalVehicles}</p>
          <p className="text-xs text-gray-400 mt-1">detected in intersection</p>
        </div>
      </div>

      {/* Lane Counts */}
      <div className="space-y-4">
        {/* North Lane */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-300">
              🔼 NORTH
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getLaneColor(laneCounts.north)}`}>
              {laneCounts.north}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getLaneBarColor(laneCounts.north)} transition-all duration-300`}
              style={{ width: getLaneBarWidth(laneCounts.north) }}
            />
          </div>
        </div>

        {/* South Lane */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-300">
              🔽 SOUTH
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getLaneColor(laneCounts.south)}`}>
              {laneCounts.south}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getLaneBarColor(laneCounts.south)} transition-all duration-300`}
              style={{ width: getLaneBarWidth(laneCounts.south) }}
            />
          </div>
        </div>

        {/* East Lane */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-300">
              ▶️ EAST
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getLaneColor(laneCounts.east)}`}>
              {laneCounts.east}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getLaneBarColor(laneCounts.east)} transition-all duration-300`}
              style={{ width: getLaneBarWidth(laneCounts.east) }}
            />
          </div>
        </div>

        {/* West Lane */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-300">
              ◀️ WEST
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getLaneColor(laneCounts.west)}`}>
              {laneCounts.west}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getLaneBarColor(laneCounts.west)} transition-all duration-300`}
              style={{ width: getLaneBarWidth(laneCounts.west) }}
            />
          </div>
        </div>
      </div>

      {/* Vehicle Type Breakdown (if statistics available) */}
      {statistics && (
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <p className="text-xs font-semibold text-gray-400 mb-3">
            Vehicle Types Detected:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center p-2 bg-gray-700/30 rounded-lg">
              <Car className="w-4 h-4 text-green-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Cars</p>
                <p className="text-sm font-bold text-white">{statistics.cars}</p>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-gray-700/30 rounded-lg">
              <Bike className="w-4 h-4 text-cyan-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Motorcycles</p>
                <p className="text-sm font-bold text-white">{statistics.motorcycles}</p>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-gray-700/30 rounded-lg">
              <Bus className="w-4 h-4 text-yellow-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Buses</p>
                <p className="text-sm font-bold text-white">{statistics.buses}</p>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-gray-700/30 rounded-lg">
              <Truck className="w-4 h-4 text-orange-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Trucks</p>
                <p className="text-sm font-bold text-white">{statistics.trucks}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/30">
            <p className="text-xs text-blue-300">
              Detection Confidence: 
              <span className="font-bold ml-1">
                {(statistics.avg_confidence * 100).toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Congestion Alert */}
      {totalVehicles > 25 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
          <p className="text-sm text-red-400 font-semibold flex items-center">
            <span className="mr-2">⚠️</span>
            High Congestion Detected!
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleCounter;