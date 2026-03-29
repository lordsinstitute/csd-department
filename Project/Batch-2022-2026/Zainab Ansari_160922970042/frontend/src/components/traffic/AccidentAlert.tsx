'use client'

import { AlertTriangle, MapPin, Clock, X, Car, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface AccidentAlertProps {
  accident: {
    type: string
    location: string
    vehicles_involved: (number | string)[]
    timestamp: number
    severity: string
    confidence?: number
    vehicle_types?: string[]
    stationary_frames?: number
  } | null
  onDismiss?: () => void
}

export default function AccidentAlert({ accident, onDismiss }: AccidentAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!accident || !isVisible) return null

  function handleDismiss() {
    setIsVisible(false)
    if (onDismiss) onDismiss()
  }

  function getSeverityConfig(severity: string) {
    const severityLower = severity.toLowerCase()
    
    switch (severityLower) {
      case 'critical':
        return {
          color: 'border-red-500 bg-red-500/20',
          icon: '🔴',
          text: 'CRITICAL',
          pulse: 'animate-pulse',
          badgeClass: 'bg-red-500 text-white'
        }
      case 'high':
        return {
          color: 'border-orange-500 bg-orange-500/20',
          icon: '🟠',
          text: 'HIGH',
          pulse: 'animate-pulse',
          badgeClass: 'bg-orange-500 text-white'
        }
      case 'medium':
        return {
          color: 'border-yellow-500 bg-yellow-500/20',
          icon: '🟡',
          text: 'MEDIUM',
          pulse: '',
          badgeClass: 'bg-yellow-500 text-black'
        }
      default:
        return {
          color: 'border-yellow-500 bg-yellow-500/20',
          icon: '🟡',
          text: 'LOW',
          pulse: '',
          badgeClass: 'bg-yellow-500 text-black'
        }
    }
  }

  const config = getSeverityConfig(accident.severity)
  const isCollision = accident.type === 'collision'

  return (
    <div className={`glass rounded-xl p-6 border-2 ${config.color} ${config.pulse}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-500 rounded-lg animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-red-400">
                  {isCollision ? '⚠️ COLLISION DETECTED' : '⚠️ INCIDENT DETECTED'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.badgeClass}`}>
                  {config.icon} {config.text}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {isCollision ? 'Vehicle collision in progress' : 'Stationary vehicle detected'}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Location */}
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">Location</span>
              </div>
              <div className="text-sm font-bold text-white">{accident.location}</div>
            </div>

            {/* Vehicles Involved */}
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Car className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Vehicles</span>
              </div>
              <div className="text-sm font-bold text-white">
                {accident.vehicles_involved.length}
              </div>
            </div>

            {/* Time */}
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Detected</span>
              </div>
              <div className="text-sm font-bold text-white">
                {new Date(accident.timestamp * 1000).toLocaleTimeString()}
              </div>
            </div>

            {/* Confidence */}
            {accident.confidence && (
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Confidence</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {(accident.confidence * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>

          {/* Vehicle IDs */}
          <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Vehicle IDs</div>
            <div className="flex flex-wrap gap-2">
              {accident.vehicles_involved.map((id, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <span className="text-xs font-bold text-red-400">
                    #{id}
                    {accident.vehicle_types && accident.vehicle_types[idx] && (
                      <span className="ml-2 text-gray-400">
                        ({accident.vehicle_types[idx]})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stationary Info */}
          {accident.stationary_frames && (
            <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="text-xs text-yellow-400">
                ⏱️ Vehicle stationary for {accident.stationary_frames} frames
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Alert Emergency Services</span>
            </button>
            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>View Location</span>
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Severity Indicator Bar */}
      <div className="mt-4 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            config.text === 'CRITICAL' ? 'bg-red-500' :
            config.text === 'HIGH' ? 'bg-orange-500' :
            'bg-yellow-500'
          } animate-pulse`}
          style={{ width: '100%' }}
        ></div>
      </div>
    </div>
  )
}