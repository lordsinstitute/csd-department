// frontend/src/components/video/VideoMetrics.tsx

/**
 * Video Metrics Component
 * Displays real-time metrics and DQN decisions for video processing
 */

import React from 'react';
import { TrafficState, DQNInferenceResponse } from '@/types/video.types';
import { Activity, Brain, Clock, TrendingUp } from 'lucide-react';

interface VideoMetricsProps {
  state: TrafficState | null;
  dqnDecision?: DQNInferenceResponse | null;
}

export const VideoMetrics: React.FC<VideoMetricsProps> = ({
  state,
  dqnDecision,
}) => {
  if (!state) {
    return (
      <div className="glass rounded-xl p-6 border-2 border-gray-500/50">
        <h3 className="text-lg font-bold text-white mb-4">
          Video Metrics
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No video data available</p>
        </div>
      </div>
    );
  }

  const totalQueue = 
    state.north_queue + 
    state.south_queue + 
    state.east_queue + 
    state.west_queue;

  const avgWaitTime = (
    state.north_waiting + 
    state.south_waiting + 
    state.east_waiting + 
    state.west_waiting
  ) / 4;

  const phaseText = state.current_phase === 0 
    ? 'North-South GREEN' 
    : 'East-West GREEN';
  
  const phaseColor = state.current_phase === 0 
    ? 'from-blue-500 to-blue-600' 
    : 'from-red-500 to-red-600';

  return (
    <div className="glass rounded-xl p-6 border-2 border-orange-500/50">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-orange-400" />
        Live Video Metrics
      </h3>

      {/* Current Signal State */}
      <div className={`mb-6 p-4 bg-gradient-to-r ${phaseColor} rounded-lg`}>
        <div className="flex justify-between items-center text-white">
          <div>
            <p className="text-xs opacity-75">Current Signal</p>
            <p className="text-xl font-bold">{phaseText}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">Time in Phase</p>
            <p className="text-xl font-bold">{state.time_in_phase.toFixed(0)}s</p>
          </div>
        </div>
        <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-1000"
            style={{ 
              width: `${Math.min((state.time_in_phase / 60) * 100, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400 mr-2" />
            <p className="text-xs text-purple-300">Total Queue</p>
          </div>
          <p className="text-3xl font-bold text-white">{totalQueue}</p>
          <p className="text-xs text-gray-400 mt-1">vehicles waiting</p>
        </div>

        <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 text-orange-400 mr-2" />
            <p className="text-xs text-orange-300">Avg Wait</p>
          </div>
          <p className="text-3xl font-bold text-white">{avgWaitTime.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-1">seconds</p>
        </div>
      </div>

      {/* DQN Decision (if available) */}
      {dqnDecision && (
        <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
          <div className="flex items-center mb-3">
            <Brain className="w-5 h-5 text-cyan-400 mr-2" />
            <p className="text-sm font-semibold text-cyan-300">AI Decision</p>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-white">
              {dqnDecision.action === 0 ? '✋ KEEP Signal' : '🔄 SWITCH Signal'}
            </p>
            {dqnDecision.confidence && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Confidence</p>
                <p className="text-lg font-bold text-cyan-400">
                  {(dqnDecision.confidence * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          {dqnDecision.explanation && (
            <div className="p-2 bg-white/5 rounded text-xs text-gray-300">
              {dqnDecision.explanation}
            </div>
          )}
        </div>
      )}

      {/* Video Frame Info */}
      {state.frame_number !== undefined && (
        <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <div className="flex justify-between items-center text-xs">
            <span className="text-purple-300">
              Frame: <strong className="text-white">{state.frame_number}</strong>
            </span>
            <span className="text-purple-300">
              Time: <strong className="text-white">{state.video_timestamp?.toFixed(2)}s</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoMetrics;