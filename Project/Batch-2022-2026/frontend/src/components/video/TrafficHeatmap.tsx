'use client'

import { useEffect, useRef } from 'react'

interface HeatmapCell {
  x: number
  y: number
  width: number
  height: number
  density: number
  color: string
}

interface TrafficHeatmapProps {
  cells: HeatmapCell[]
  videoWidth: number
  videoHeight: number
  opacity?: number
  showGrid?: boolean
}

export default function TrafficHeatmap({
  cells,
  videoWidth,
  videoHeight,
  opacity = 0.6,
  showGrid = false
}: TrafficHeatmapProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    // responsive size
    const displayWidth = parent.clientWidth
    const displayHeight = parent.clientHeight

    canvas.width = displayWidth
    canvas.height = displayHeight

    const scaleX = displayWidth / videoWidth
    const scaleY = displayHeight / videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!cells || cells.length === 0) return

    cells.forEach(cell => {

      if (!cell) return

      const sx = cell.x * scaleX
      const sy = cell.y * scaleY
      const sw = (cell.width || 50) * scaleX
      const sh = (cell.height || 50) * scaleY
      const density = cell.density || 0

      const cx = sx + sw / 2
      const cy = sy + sh / 2

      const radius = Math.max(sw, sh)

      const gradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        radius
      )

      const color = getDensityColor(cell.color || 'blue', density)
      const transparent = getDensityColor(cell.color || 'blue', density * 0.2)

      gradient.addColorStop(0, color)
      gradient.addColorStop(1, transparent)

      ctx.fillStyle = gradient
      ctx.fillRect(sx, sy, sw, sh)

      // grid
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 1
        ctx.strokeRect(sx, sy, sw, sh)
      }

      // density text
      if (density > 0.7) {

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.fillText(
          `${Math.round(density * 100)}%`,
          cx,
          cy
        )
      }

    })

    drawLegend(ctx, displayWidth)

  }, [cells, videoWidth, videoHeight, opacity, showGrid])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    />
  )
}

function getDensityColor(colorName: string, density: number): string {

  const alpha = Math.min(density * 0.8, 0.9)

  const colors: Record<string, string> = {

    blue: `rgba(0,120,255,${alpha})`,
    yellow: `rgba(255,200,0,${alpha})`,
    red: `rgba(255,60,60,${alpha})`,
    green: `rgba(0,255,120,${alpha})`

  }

  return colors[colorName] || `rgba(0,255,0,${alpha})`
}

function drawLegend(ctx: CanvasRenderingContext2D, width: number) {

  const legendWidth = 150
  const legendHeight = 70

  const x = width - legendWidth - 20
  const y = 20

  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(x, y, legendWidth, legendHeight)

  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.strokeRect(x, y, legendWidth, legendHeight)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'left'

  ctx.fillText('Traffic Density', x + 10, y + 18)

  const scaleY = y + 30
  const scaleWidth = legendWidth - 20
  const scaleHeight = 15

  const gradient = ctx.createLinearGradient(x + 10, 0, x + 10 + scaleWidth, 0)

  gradient.addColorStop(0, 'rgba(0,120,255,0.8)')
  gradient.addColorStop(0.5, 'rgba(255,200,0,0.8)')
  gradient.addColorStop(1, 'rgba(255,60,60,0.8)')

  ctx.fillStyle = gradient
  ctx.fillRect(x + 10, scaleY, scaleWidth, scaleHeight)

  ctx.font = '10px Arial'

  ctx.textAlign = 'left'
  ctx.fillText('Low', x + 10, scaleY + 30)

  ctx.textAlign = 'right'
  ctx.fillText('High', x + 10 + scaleWidth, scaleY + 30)
}