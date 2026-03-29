// frontend/src/components/video/VideoPlayer.tsx

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { api } from '@/lib/api'
import { FrameResult } from '@/types/detection.types'

interface VideoPlayerProps {
  videoInfo: any;
  onFrameUpdate?: (frame: FrameResult) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoInfo,
  onFrameUpdate
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState<FrameResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Process next frame
  const processFrame = async () => {
    try {
      const frame = await api.getNextFrame()
      
      if (frame && frame.frame_number) {
        setCurrentFrame(frame)
        setProgress((frame.frame_number / videoInfo.total_frames) * 100)
        
        if (onFrameUpdate) {
          onFrameUpdate(frame)
        }
      } else {
        // Video ended
        setIsPlaying(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } catch (err: any) {
      setError(err.message)
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  // Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsPlaying(false)
    } else {
      // Play
      setIsPlaying(true)
      setError(null)
      
      // Process frames at video FPS
      const frameInterval = 1000 / (videoInfo.fps || 30)
      intervalRef.current = setInterval(processFrame, frameInterval)
    }
  }

  // Reset video
  const handleReset = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setIsPlaying(false)
      setProgress(0)
      setCurrentFrame(null)
      await api.resetVideo()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Skip frame
  const skipFrame = async () => {
    await processFrame()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="glass rounded-xl p-6 border-2 border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">🎥 Video Playback</h3>
        <div className="text-sm text-gray-400">
          Frame: {currentFrame?.frame_number || 0} / {videoInfo.total_frames}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={togglePlay}
          disabled={!videoInfo}
          className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all ${
            isPlaying
              ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
              : 'bg-green-600 hover:bg-green-500 text-white'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Play
            </>
          )}
        </button>

        <button
          onClick={skipFrame}
          disabled={!videoInfo || isPlaying}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-5 h-5 mr-2" />
          Next Frame
        </button>

        <button
          onClick={handleReset}
          disabled={!videoInfo}
          className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </button>
      </div>

      {/* Current Frame Info */}
      {currentFrame && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="text-xs text-gray-400">Vehicles</div>
            <div className="text-2xl font-bold text-white">
              {currentFrame.total_vehicles}
            </div>
          </div>

          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-xs text-gray-400">Timestamp</div>
            <div className="text-lg font-bold text-white">
              {currentFrame.timestamp.toFixed(1)}s
            </div>
          </div>

          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="text-xs text-gray-400">Signal Phase</div>
            <div className="text-lg font-bold text-white">
              {currentFrame.signal_phase === 0 ? 'NS' : 'EW'}
            </div>
          </div>

          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <div className="text-xs text-gray-400">DQN Action</div>
            <div className="text-lg font-bold text-white">
              {currentFrame.dqn_action === 0 ? 'Keep' : 'Switch'}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="text-sm text-red-400">❌ {error}</div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer