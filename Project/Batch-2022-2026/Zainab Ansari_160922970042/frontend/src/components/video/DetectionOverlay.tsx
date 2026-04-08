'use client'

import { useEffect, useRef } from 'react'

interface Detection {
  bbox: number[]
  class: string
  confidence: number
  track_id?: number
}

interface DetectionOverlayProps {
  detections: Detection[]
  videoWidth: number
  videoHeight: number
  showLabels?: boolean
  showTrackingIds?: boolean
  showConfidence?: boolean
}

// Store movement history
const trackHistory: Record<number, { x: number; y: number }[]> = {}

export default function DetectionOverlay({
  detections,
  videoWidth,
  videoHeight,
  showLabels = true,
  showTrackingIds = true,
  showConfidence = true
}: DetectionOverlayProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    const displayWidth = parent.clientWidth
    const displayHeight = parent.clientHeight

    canvas.width = displayWidth
    canvas.height = displayHeight

    const scaleX = displayWidth / videoWidth
    const scaleY = displayHeight / videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!detections || detections.length === 0) return

    detections.forEach((det) => {

      if (!det.bbox || det.bbox.length < 4) return

      const [x1, y1, x2, y2] = det.bbox

      const sx1 = x1 * scaleX
      const sy1 = y1 * scaleY
      const sx2 = x2 * scaleX
      const sy2 = y2 * scaleY

      const width = sx2 - sx1
      const height = sy2 - sy1

      const color = getVehicleColor(det.class || 'car')

      // Glow effect
      ctx.shadowBlur = 12
      ctx.shadowColor = color

      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(sx1, sy1, width, height)

      ctx.shadowBlur = 0

      // Corner markers
      const corner = 16
      ctx.lineWidth = 4

      drawCorner(ctx, sx1, sy1, corner, 'tl', color)
      drawCorner(ctx, sx2, sy1, corner, 'tr', color)
      drawCorner(ctx, sx1, sy2, corner, 'bl', color)
      drawCorner(ctx, sx2, sy2, corner, 'br', color)

      // ========================
      // LABEL
      // ========================

      if (showLabels) {

        const className = det.class.toUpperCase()
        const track = showTrackingIds && det.track_id ? `#${det.track_id}` : ''
        const conf = showConfidence && det.confidence
          ? `${(det.confidence * 100).toFixed(0)}%`
          : ''

        const label = [className, track, conf].filter(Boolean).join(' ')

        ctx.font = 'bold 14px Arial'
        const textWidth = ctx.measureText(label).width
        const padding = 6
        const boxHeight = 20

        const gradient = ctx.createLinearGradient(sx1, sy1 - 30, sx1, sy1)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, adjustColorBrightness(color, -30))

        ctx.fillStyle = gradient
        ctx.fillRect(
          sx1,
          sy1 - boxHeight - padding,
          textWidth + padding * 2,
          boxHeight
        )

        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.strokeRect(
          sx1,
          sy1 - boxHeight - padding,
          textWidth + padding * 2,
          boxHeight
        )

        ctx.fillStyle = '#fff'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, sx1 + padding, sy1 - boxHeight / 2)
      }

      // ========================
      // TRACKING CENTER + TRAIL
      // ========================

      if (det.track_id !== undefined) {

        const cx = sx1 + width / 2
        const cy = sy1 + height / 2

        // Save history
        if (!trackHistory[det.track_id]) {
          trackHistory[det.track_id] = []
        }

        trackHistory[det.track_id].push({ x: cx, y: cy })

        if (trackHistory[det.track_id].length > 20) {
          trackHistory[det.track_id].shift()
        }

        const history = trackHistory[det.track_id]

        // Draw trajectory
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()

        history.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })

        ctx.stroke()

        // Draw center dot
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // ========================
      // CONFIDENCE BAR
      // ========================

      if (showConfidence && det.confidence) {

        const barWidth = width
        const barHeight = 6

        const barX = sx1
        const barY = sy2 + 4

        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(barX, barY, barWidth, barHeight)

        const fillWidth = barWidth * det.confidence

        ctx.fillStyle = getConfidenceColor(det.confidence)
        ctx.fillRect(barX, barY, fillWidth, barHeight)

        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.strokeRect(barX, barY, barWidth, barHeight)
      }

    })

  }, [detections, videoWidth, videoHeight, showLabels, showTrackingIds, showConfidence])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  )
}

// ========================
// HELPERS
// ========================

function drawCorner(ctx: any, x: number, y: number, size: number, type: string, color: string) {

  ctx.strokeStyle = color
  ctx.beginPath()

  if (type === 'tl') {
    ctx.moveTo(x, y + size)
    ctx.lineTo(x, y)
    ctx.lineTo(x + size, y)
  }

  if (type === 'tr') {
    ctx.moveTo(x - size, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + size)
  }

  if (type === 'bl') {
    ctx.moveTo(x, y - size)
    ctx.lineTo(x, y)
    ctx.lineTo(x + size, y)
  }

  if (type === 'br') {
    ctx.moveTo(x - size, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y - size)
  }

  ctx.stroke()
}

function getVehicleColor(vehicleClass: string) {

  const colors: Record<string, string> = {
    car: '#00FF00',
    truck: '#FF6600',
    bus: '#FFFF00',
    motorcycle: '#00FFFF',
    bicycle: '#FF00FF',
    ambulance: '#FF0000',
    fire_truck: '#FF0000',
    police: '#0000FF',
    person: '#FFA500'
  }

  return colors[vehicleClass.toLowerCase()] || '#00FF00'
}

function getConfidenceColor(conf: number) {

  if (conf > 0.9) return '#00FF00'
  if (conf > 0.7) return '#FFFF00'
  if (conf > 0.5) return '#FFA500'
  return '#FF0000'
}

function adjustColorBrightness(color: string, amount: number) {

  const hex = color.replace('#', '')

  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}