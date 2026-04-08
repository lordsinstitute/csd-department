'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { VideoUploadPanel } from '@/components/video/VideoUploadPanel'
import DetectionOverlay from '@/components/video/DetectionOverlay'
import TrafficHeatmap from '@/components/video/TrafficHeatmap'
import AIDecisionExplainer from '@/components/traffic/AIDecisionExplainer'
import AccidentAlert from '@/components/traffic/AccidentAlert'

import { Play, Pause, RotateCcw, Eye, EyeOff, Video } from 'lucide-react'

interface VideoInfo {
  filename: string
  video_info: {
    width: number
    height: number
    fps: number
    total_frames: number
  }
}

interface FrameData {
  frame: string
  frame_number: number
  total_vehicles: number
  detections: any[]
  lane_counts: {
    north: number
    south: number
    east: number
    west: number
  }
  heatmap: {
    cells: any[]
  }
  statistics: {
    avg_confidence: number
    active_tracks: number
  }
  accident?: any
}

export default function VideoAnalysisPage() {

  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("uploaded_video")
      return saved ? JSON.parse(saved) : null
    }
    return null
  })

  const [currentFrame, setCurrentFrame] = useState<FrameData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const [showDetections, setShowDetections] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true)

  const [aiDecision, setAiDecision] = useState<any>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // =============================
  // Upload Handler
  // =============================

  function handleVideoUploaded(info: VideoInfo) {
    setVideoInfo(info)
    setCurrentFrame(null)
    localStorage.setItem("uploaded_video", JSON.stringify(info))
  }

  // =============================
  // Play Video
  // =============================

  function handlePlay() {

    if (!videoInfo) return

    setIsPlaying(true)

    intervalRef.current = setInterval(async () => {

      try {

        const res = await fetch('http://localhost:8000/api/video/next-frame')
        const data = await res.json()

        if (data.status === "end_of_video") {
          handlePause()
          return
        }

        setCurrentFrame(data)

        // AI Decision
        if (data.lane_counts) {

          const aiRes = await fetch(
            'http://localhost:8000/api/traffic/optimize-signal',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                north_count: data.lane_counts.north,
                south_count: data.lane_counts.south,
                east_count: data.lane_counts.east,
                west_count: data.lane_counts.west,
                current_phase: 0,
                time_in_phase: 0,
                emergency: 0
              })
            }
          )

          const aiData = await aiRes.json()
          setAiDecision(aiData.explanation)
        }

      } catch (err) {
        console.error("Frame error", err)
      }

    }, 120)
  }

  // =============================
  // Pause
  // =============================

  function handlePause() {

    setIsPlaying(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // =============================
  // Reset
  // =============================

  async function handleReset() {

    handlePause()

    await fetch(
      'http://localhost:8000/api/video/reset',
      { method: 'POST' }
    )

    setCurrentFrame(null)
    setVideoInfo(null)
    localStorage.removeItem("uploaded_video")
  }

  // =============================
  // UI
  // =============================

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header
          title="Video Analysis & Detection"
          subtitle="YOLOv8 + ByteTrack Real-time Processing"
        />

        <main className="p-8 flex-1 overflow-auto">

          {/* Upload Panel */}
          {!videoInfo && !currentFrame && (
            <VideoUploadPanel onVideoUploaded={handleVideoUploaded} />
          )}

          {/* Video Section */}
          {videoInfo && (

            <div className="grid lg:grid-cols-3 gap-6">

              {/* LEFT SIDE */}
              <div className="lg:col-span-2 space-y-6">

                {/* Video Info */}
                <div className="glass p-4 rounded-xl border border-green-500/40">
                  <div className="flex gap-3 items-center">
                    <Video className="text-green-400 w-6 h-6" />
                    <div>
                      <div className="text-white font-bold">
                        {videoInfo.filename}
                      </div>
                      <div className="text-sm text-gray-400">
                        {videoInfo.video_info.width} × {videoInfo.video_info.height}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Player */}
                <div className="glass p-6 rounded-xl border border-cyan-500/40">

                  <div
                    className="relative bg-black rounded-lg overflow-hidden"
                    style={{ aspectRatio: "16/9" }}
                  >

                    {currentFrame?.frame ? (
                      <img
                        src={`data:image/jpeg;base64,${currentFrame.frame}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Ready to Play
                      </div>
                    )}

                    {showDetections && currentFrame?.detections && (
                      <DetectionOverlay
                        detections={currentFrame.detections}
                        videoWidth={videoInfo.video_info.width}
                        videoHeight={videoInfo.video_info.height}
                      />
                    )}

                    {showHeatmap && currentFrame?.heatmap?.cells && (
                      <TrafficHeatmap
                        cells={currentFrame.heatmap.cells}
                        videoWidth={videoInfo.video_info.width}
                        videoHeight={videoInfo.video_info.height}
                      />
                    )}

                  </div>

                  {/* Controls */}
                  <div className="flex gap-3 mt-4">

                    {!isPlaying ? (
                      <button
                        onClick={handlePlay}
                        className="bg-green-600 px-6 py-3 rounded-lg flex gap-2"
                      >
                        <Play /> Play
                      </button>
                    ) : (
                      <button
                        onClick={handlePause}
                        className="bg-yellow-600 px-6 py-3 rounded-lg flex gap-2"
                      >
                        <Pause /> Pause
                      </button>
                    )}

                    <button
                      onClick={handleReset}
                      className="bg-purple-600 px-4 py-3 rounded-lg flex gap-2"
                    >
                      <RotateCcw /> Reset
                    </button>

                    <button
                      onClick={() => setShowDetections(!showDetections)}
                      className="bg-cyan-500 px-4 py-2 rounded-lg flex gap-2"
                    >
                      {showDetections ? <Eye /> : <EyeOff />}
                      Detections
                    </button>

                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className="bg-orange-500 px-4 py-2 rounded-lg flex gap-2"
                    >
                      {showHeatmap ? <Eye /> : <EyeOff />}
                      Heatmap
                    </button>

                  </div>

                </div>

                {/* Stats */}
                {currentFrame && (

                  <div className="glass p-6 rounded-xl border border-blue-500/40">

                    <div className="grid grid-cols-4 gap-3">

                      <Stat label="Frame" value={currentFrame.frame_number ?? 0} />
                      <Stat label="Vehicles" value={currentFrame.total_vehicles ?? 0} />

                      <Stat
                        label="Confidence"
                        value={`${((currentFrame.statistics?.avg_confidence ?? 0) * 100).toFixed(0)}%`}
                      />

                      <Stat
                        label="Tracks"
                        value={currentFrame.statistics?.active_tracks ?? 0}
                      />

                    </div>

                  </div>

                )}

              </div>

              {/* RIGHT PANEL */}
              <div className="space-y-6">

                {currentFrame?.accident && (
                  <AccidentAlert accident={currentFrame.accident} />
                )}

                <AIDecisionExplainer decision={aiDecision} />

              </div>

            </div>

          )}

        </main>

      </div>

    </div>
  )
}

function Stat({ label, value }: any) {
  return (
    <div>
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}