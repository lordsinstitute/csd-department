'use client'

import { useEffect, useRef, useState } from 'react'

interface Vehicle {
  id: number
  x: number
  y: number
  direction: 'north' | 'south' | 'east' | 'west'
  type: 'car' | 'truck' | 'bus'
  speed: number
  color: string
}

interface DigitalTwinProps {
  width?: number
  height?: number
  signalPhase: 'NS_GREEN' | 'EW_GREEN'
  vehicleCount: number
  showAIOverlay?: boolean
}

export default function DigitalTwin({
  width = 800,
  height = 600,
  signalPhase,
  vehicleCount,
  showAIOverlay = true
}: DigitalTwinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const animationRef = useRef<number>()

  // Initialize vehicles
  useEffect(() => {
    const initialVehicles: Vehicle[] = []
    const directions: Array<'north' | 'south' | 'east' | 'west'> = ['north', 'south', 'east', 'west']
    const types: Array<'car' | 'truck' | 'bus'> = ['car', 'truck', 'bus']
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

    for (let i = 0; i < vehicleCount; i++) {
      const direction = directions[Math.floor(Math.random() * directions.length)]
      const type = types[Math.floor(Math.random() * types.length)]
      
      let x, y
      switch (direction) {
        case 'north':
          x = width / 2 + 30
          y = height + Math.random() * 200
          break
        case 'south':
          x = width / 2 - 30
          y = -Math.random() * 200
          break
        case 'east':
          x = -Math.random() * 200
          y = height / 2 - 30
          break
        case 'west':
          x = width + Math.random() * 200
          y = height / 2 + 30
          break
      }

      initialVehicles.push({
        id: i,
        x,
        y,
        direction,
        type,
        speed: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    setVehicles(initialVehicles)
  }, [vehicleCount, width, height])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw road
      drawRoad(ctx, width, height)

      // Draw traffic lights
      drawTrafficLights(ctx, width, height, signalPhase)

      // Update and draw vehicles
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.map(vehicle => {
          return updateVehicle(vehicle, width, height, signalPhase)
        })

        updatedVehicles.forEach(vehicle => {
          drawVehicle(ctx, vehicle)
        })

        return updatedVehicles
      })

      // Draw AI overlay
      if (showAIOverlay) {
        drawAIOverlay(ctx, width, height, signalPhase)
      }

      // Draw congestion zones
      drawCongestionZones(ctx, width, height, vehicles)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [width, height, signalPhase, showAIOverlay, vehicles])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-cyan-500/30 rounded-lg shadow-2xl"
      />
      
      {/* Info Overlay */}
      <div className="absolute top-4 left-4 glass rounded-lg p-3 border border-cyan-500/30">
        <div className="text-xs text-gray-400 mb-1">Digital Twin Status</div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-white">LIVE</span>
        </div>
      </div>

      {/* Signal Phase Indicator */}
      <div className="absolute top-4 right-4 glass rounded-lg p-3 border border-cyan-500/30">
        <div className="text-xs text-gray-400 mb-1">Current Phase</div>
        <div className="text-sm font-bold text-white">
          {signalPhase === 'NS_GREEN' ? '↕️ North/South GREEN' : '↔️ East/West GREEN'}
        </div>
      </div>

      {/* Vehicle Count */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-3 border border-cyan-500/30">
        <div className="text-xs text-gray-400 mb-1">Active Vehicles</div>
        <div className="text-2xl font-bold text-cyan-400">{vehicles.length}</div>
      </div>
    </div>
  )
}

function drawRoad(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Background
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, width, height)

  // Road - Vertical
  ctx.fillStyle = '#2d2d2d'
  ctx.fillRect(width / 2 - 60, 0, 120, height)

  // Road - Horizontal
  ctx.fillRect(0, height / 2 - 60, width, 120)

  // Center lines - Vertical
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 2
  ctx.setLineDash([20, 15])
  ctx.beginPath()
  ctx.moveTo(width / 2, 0)
  ctx.lineTo(width / 2, height)
  ctx.stroke()

  // Center lines - Horizontal
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
  ctx.setLineDash([])

  // Lane dividers
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 1
  ctx.setLineDash([10, 10])
  
  // Vertical lanes
  ctx.beginPath()
  ctx.moveTo(width / 2 - 30, 0)
  ctx.lineTo(width / 2 - 30, height)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(width / 2 + 30, 0)
  ctx.lineTo(width / 2 + 30, height)
  ctx.stroke()

  // Horizontal lanes
  ctx.beginPath()
  ctx.moveTo(0, height / 2 - 30)
  ctx.lineTo(width, height / 2 - 30)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(0, height / 2 + 30)
  ctx.lineTo(width, height / 2 + 30)
  ctx.stroke()
  
  ctx.setLineDash([])
}

function drawTrafficLights(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: 'NS_GREEN' | 'EW_GREEN'
) {
  const lightSize = 20
  const positions = [
    { x: width / 2 - 80, y: height / 2 - 80, type: 'ns' },  // North
    { x: width / 2 - 80, y: height / 2 + 60, type: 'ns' },  // South
    { x: width / 2 - 80, y: height / 2 - 10, type: 'ew' },  // West
    { x: width / 2 + 60, y: height / 2 - 10, type: 'ew' },  // East
  ]

  positions.forEach(pos => {
    const isGreen = (pos.type === 'ns' && phase === 'NS_GREEN') ||
                    (pos.type === 'ew' && phase === 'EW_GREEN')

    // Light pole
    ctx.fillStyle = '#333'
    ctx.fillRect(pos.x - 5, pos.y - 30, 10, 30)

    // Light box
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(pos.x - lightSize / 2, pos.y - lightSize / 2, lightSize, lightSize)

    // Light
    if (isGreen) {
      ctx.fillStyle = '#00FF00'
      ctx.shadowBlur = 20
      ctx.shadowColor = '#00FF00'
    } else {
      ctx.fillStyle = '#FF0000'
      ctx.shadowBlur = 20
      ctx.shadowColor = '#FF0000'
    }

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, lightSize / 3, 0, 2 * Math.PI)
    ctx.fill()
    ctx.shadowBlur = 0
  })
}

function updateVehicle(
  vehicle: Vehicle,
  width: number,
  height: number,
  signalPhase: 'NS_GREEN' | 'EW_GREEN'
): Vehicle {
  const stopDistance = 80
  const centerX = width / 2
  const centerY = height / 2

  let newX = vehicle.x
  let newY = vehicle.y
  let canMove = true

  // Check if vehicle should stop at light
  switch (vehicle.direction) {
    case 'north':
      if (signalPhase !== 'NS_GREEN' && vehicle.y > centerY && vehicle.y < centerY + stopDistance) {
        canMove = false
      }
      if (canMove) newY -= vehicle.speed
      break
    case 'south':
      if (signalPhase !== 'NS_GREEN' && vehicle.y < centerY && vehicle.y > centerY - stopDistance) {
        canMove = false
      }
      if (canMove) newY += vehicle.speed
      break
    case 'east':
      if (signalPhase !== 'EW_GREEN' && vehicle.x < centerX && vehicle.x > centerX - stopDistance) {
        canMove = false
      }
      if (canMove) newX += vehicle.speed
      break
    case 'west':
      if (signalPhase !== 'EW_GREEN' && vehicle.x > centerX && vehicle.x < centerX + stopDistance) {
        canMove = false
      }
      if (canMove) newX -= vehicle.speed
      break
  }

  // Respawn if out of bounds
  if (newY < -50) newY = height + 50
  if (newY > height + 50) newY = -50
  if (newX < -50) newX = width + 50
  if (newX > width + 50) newX = -50

  return { ...vehicle, x: newX, y: newY }
}

function drawVehicle(ctx: CanvasRenderingContext2D, vehicle: Vehicle) {
  ctx.save()
  ctx.translate(vehicle.x, vehicle.y)

  // Rotate based on direction
  switch (vehicle.direction) {
    case 'north':
      ctx.rotate(-Math.PI / 2)
      break
    case 'south':
      ctx.rotate(Math.PI / 2)
      break
    case 'west':
      ctx.rotate(Math.PI)
      break
  }

  // Vehicle body
  const vehicleWidth = vehicle.type === 'bus' ? 30 : vehicle.type === 'truck' ? 25 : 20
  const vehicleHeight = vehicle.type === 'bus' ? 15 : vehicle.type === 'truck' ? 12 : 10

  ctx.fillStyle = vehicle.color
  ctx.fillRect(-vehicleWidth / 2, -vehicleHeight / 2, vehicleWidth, vehicleHeight)

  // Vehicle outline
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  ctx.strokeRect(-vehicleWidth / 2, -vehicleHeight / 2, vehicleWidth, vehicleHeight)

  // Headlights
  ctx.fillStyle = '#FFFF00'
  ctx.fillRect(vehicleWidth / 2 - 2, -vehicleHeight / 4, 3, 2)
  ctx.fillRect(vehicleWidth / 2 - 2, vehicleHeight / 4 - 2, 3, 2)

  ctx.restore()
}

function drawAIOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: 'NS_GREEN' | 'EW_GREEN'
) {
  // AI decision indicator
  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)'
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
  ctx.lineWidth = 2

  if (phase === 'NS_GREEN') {
    // Highlight N/S lanes
    ctx.fillRect(width / 2 - 60, 0, 120, height)
    ctx.strokeRect(width / 2 - 60, 0, 120, height)
  } else {
    // Highlight E/W lanes
    ctx.fillRect(0, height / 2 - 60, width, 120)
    ctx.strokeRect(0, height / 2 - 60, width, 120)
  }

  // AI label
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(width / 2 - 80, 20, 160, 40)
  
  ctx.fillStyle = '#00FFFF'
  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('🤖 AI OPTIMIZING', width / 2, 40)
  ctx.fillText(phase === 'NS_GREEN' ? 'North/South Priority' : 'East/West Priority', width / 2, 55)
}

function drawCongestionZones(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  vehicles: Vehicle[]
) {
  // Count vehicles per quadrant
  const quadrants = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  }

  vehicles.forEach(v => {
    if (v.direction === 'north') quadrants.north++
    if (v.direction === 'south') quadrants.south++
    if (v.direction === 'east') quadrants.east++
    if (v.direction === 'west') quadrants.west++
  })

  // Draw congestion indicators
  const maxVehicles = Math.max(...Object.values(quadrants))
  
  Object.entries(quadrants).forEach(([dir, count]) => {
    if (count > 3) {
      const intensity = count / maxVehicles
      ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.3})`
      
      let x, y, w, h
      switch (dir) {
        case 'north':
          x = width / 2 - 60
          y = 0
          w = 120
          h = height / 2 - 60
          break
        case 'south':
          x = width / 2 - 60
          y = height / 2 + 60
          w = 120
          h = height / 2 - 60
          break
        case 'east':
          x = width / 2 + 60
          y = height / 2 - 60
          w = width / 2 - 60
          h = 120
          break
        case 'west':
          x = 0
          y = height / 2 - 60
          w = width / 2 - 60
          h = 120
          break
        default:
          return
      }
      
      ctx.fillRect(x, y, w, h)
    }
  })
}