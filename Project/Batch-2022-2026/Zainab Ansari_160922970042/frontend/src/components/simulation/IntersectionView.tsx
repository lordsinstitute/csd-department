// frontend/src/components/simulation/IntersectionView.tsx

'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Car, Bus, Truck, Bike } from 'lucide-react'

interface Vehicle {
  id: string
  type: 'car' | 'bus' | 'truck' | 'motorcycle'
  lane: 'north' | 'south' | 'east' | 'west'
  position: number // 0-100 (percentage along lane)
  speed: number
  color: string
  waiting: boolean
}

interface IntersectionViewProps {
  northQueue?: number
  southQueue?: number
  eastQueue?: number
  westQueue?: number
  currentPhase?: number // 0 = NS green, 1 = EW green
  timeInPhase?: number
}

export const IntersectionView: React.FC<IntersectionViewProps> = ({
  northQueue = 3,
  southQueue = 2,
  eastQueue = 4,
  westQueue = 2,
  currentPhase = 0,
  timeInPhase = 0
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const animationRef = useRef<number>()
  const lastUpdateRef = useRef<number>(Date.now())

  // Vehicle colors
  const vehicleColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ]

  // Initialize vehicles
  useEffect(() => {
    const initVehicles: Vehicle[] = []
    let id = 0

    // Helper to create vehicle
    const createVehicle = (
      lane: 'north' | 'south' | 'east' | 'west',
      index: number,
      count: number
    ): Vehicle => ({
      id: `${lane}-${id++}`,
      type: Math.random() > 0.7 ? 'car' : Math.random() > 0.5 ? 'bus' : 'truck',
      lane,
      position: 100 - (index * 15) - Math.random() * 5,
      speed: 0,
      color: vehicleColors[Math.floor(Math.random() * vehicleColors.length)],
      waiting: true
    })

    // Create vehicles for each lane
    for (let i = 0; i < northQueue; i++) {
      initVehicles.push(createVehicle('north', i, northQueue))
    }
    for (let i = 0; i < southQueue; i++) {
      initVehicles.push(createVehicle('south', i, southQueue))
    }
    for (let i = 0; i < eastQueue; i++) {
      initVehicles.push(createVehicle('east', i, eastQueue))
    }
    for (let i = 0; i < westQueue; i++) {
      initVehicles.push(createVehicle('west', i, westQueue))
    }

    setVehicles(initVehicles)
  }, [northQueue, southQueue, eastQueue, westQueue])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const delta = (now - lastUpdateRef.current) / 1000
      lastUpdateRef.current = now

      setVehicles(prevVehicles => {
        return prevVehicles
          .map(vehicle => {
            // Determine if this vehicle can move
            const canMove = 
              (currentPhase === 0 && (vehicle.lane === 'north' || vehicle.lane === 'south')) ||
              (currentPhase === 1 && (vehicle.lane === 'east' || vehicle.lane === 'west'))

            let newSpeed = vehicle.speed
            let newPosition = vehicle.position

            if (canMove) {
              // Accelerate
              newSpeed = Math.min(vehicle.speed + delta * 30, 50)
              newPosition = vehicle.position - newSpeed * delta

              // Remove vehicle if it passed through intersection
              if (newPosition < -20) {
                return null
              }
            } else {
              // Decelerate near intersection
              if (vehicle.position < 60) {
                newSpeed = Math.max(vehicle.speed - delta * 50, 0)
                newPosition = Math.max(vehicle.position - newSpeed * delta, 50)
              } else {
                newSpeed = Math.min(vehicle.speed + delta * 20, 30)
                newPosition = vehicle.position - newSpeed * delta
              }
            }

            return {
              ...vehicle,
              speed: newSpeed,
              position: newPosition,
              waiting: !canMove && newPosition <= 60
            }
          })
          .filter((v): v is Vehicle => v !== null)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentPhase])

  // Get vehicle icon
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="w-full h-full" />
      case 'bus': return <Bus className="w-full h-full" />
      case 'truck': return <Truck className="w-full h-full" />
      case 'motorcycle': return <Bike className="w-full h-full" />
      default: return <Car className="w-full h-full" />
    }
  }

  // Render vehicle
  const renderVehicle = (vehicle: Vehicle) => {
    const size = vehicle.type === 'bus' ? 40 : vehicle.type === 'truck' ? 38 : 32
    let left = '50%'
    let top = '50%'
    let transform = ''

    switch (vehicle.lane) {
      case 'north':
        left = '45%'
        top = `${vehicle.position}%`
        transform = 'translateX(-50%) rotate(180deg)'
        break
      case 'south':
        left = '55%'
        top = `${100 - vehicle.position}%`
        transform = 'translateX(-50%)'
        break
      case 'east':
        left = `${100 - vehicle.position}%`
        top = '45%'
        transform = 'translateY(-50%) rotate(-90deg)'
        break
      case 'west':
        left = `${vehicle.position}%`
        top = '55%'
        transform = 'translateY(-50%) rotate(90deg)'
        break
    }

    return (
      <div
        key={vehicle.id}
        className="absolute transition-all duration-100"
        style={{
          left,
          top,
          transform,
          width: `${size}px`,
          height: `${size}px`,
          color: vehicle.color,
          opacity: vehicle.waiting ? 0.8 : 1,
          filter: vehicle.waiting ? 'none' : `drop-shadow(0 0 8px ${vehicle.color})`
        }}
      >
        {getVehicleIcon(vehicle.type)}
      </div>
    )
  }

  // Traffic light component
  const TrafficLight = ({ 
    position, 
    isGreen 
  }: { 
    position: 'top' | 'bottom' | 'left' | 'right'
    isGreen: boolean 
  }) => {
    const positionStyles = {
      top: 'top-[15%] left-1/2 -translate-x-1/2',
      bottom: 'bottom-[15%] left-1/2 -translate-x-1/2',
      left: 'left-[15%] top-1/2 -translate-y-1/2',
      right: 'right-[15%] top-1/2 -translate-y-1/2'
    }

    return (
      <div className={`absolute ${positionStyles[position]} flex gap-1 p-2 bg-gray-800/80 rounded-lg backdrop-blur-sm`}>
        <div className={`w-3 h-3 rounded-full ${isGreen ? 'bg-red-500/30' : 'bg-red-500 animate-pulse'}`} />
        <div className={`w-3 h-3 rounded-full bg-yellow-500/30`} />
        <div className={`w-3 h-3 rounded-full ${isGreen ? 'bg-green-500 animate-pulse' : 'bg-green-500/30'}`} />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 border-cyan-500/30">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Roads */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Horizontal Road */}
        <div className="absolute w-full h-[30%] bg-gray-700/80">
          {/* Road markings */}
          <div className="absolute top-1/2 left-0 w-full h-1 border-t-4 border-dashed border-yellow-400/50 -translate-y-1/2" />
        </div>

        {/* Vertical Road */}
        <div className="absolute h-full w-[30%] bg-gray-700/80">
          {/* Road markings */}
          <div className="absolute left-1/2 top-0 h-full w-1 border-l-4 border-dashed border-yellow-400/50 -translate-x-1/2" />
        </div>

        {/* Intersection Center */}
        <div className="absolute w-[30%] h-[30%] bg-gray-600/60 border-4 border-yellow-400/30" />
      </div>

      {/* Traffic Lights */}
      <TrafficLight position="top" isGreen={currentPhase === 0} />
      <TrafficLight position="bottom" isGreen={currentPhase === 0} />
      <TrafficLight position="left" isGreen={currentPhase === 1} />
      <TrafficLight position="right" isGreen={currentPhase === 1} />

      {/* Vehicles */}
      {vehicles.map(renderVehicle)}

      {/* Lane Labels */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-cyan-400 font-bold text-sm bg-gray-800/60 px-3 py-1 rounded-full backdrop-blur-sm">
        ⬆️ NORTH
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cyan-400 font-bold text-sm bg-gray-800/60 px-3 py-1 rounded-full backdrop-blur-sm">
        ⬇️ SOUTH
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-sm bg-gray-800/60 px-3 py-1 rounded-full backdrop-blur-sm">
        ◀️ WEST
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-sm bg-gray-800/60 px-3 py-1 rounded-full backdrop-blur-sm">
        ▶️ EAST
      </div>

      {/* Phase Indicator */}
      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
        <div className="text-xs text-gray-400 mb-1">Current Phase</div>
        <div className={`text-lg font-bold ${currentPhase === 0 ? 'text-blue-400' : 'text-red-400'}`}>
          {currentPhase === 0 ? '🟢 NS GREEN' : '🟢 EW GREEN'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {timeInPhase.toFixed(1)}s
        </div>
      </div>

      {/* Vehicle Count */}
      <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
        <div className="text-xs text-gray-400 mb-2">Active Vehicles</div>
        <div className="text-2xl font-bold text-white">{vehicles.length}</div>
      </div>
    </div>
  )
}

export default IntersectionView