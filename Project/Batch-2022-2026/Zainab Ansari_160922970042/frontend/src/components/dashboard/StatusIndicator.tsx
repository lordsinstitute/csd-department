import React from 'react'

interface StatusIndicatorProps {
  status: 'active' | 'connected' | 'ready' | 'inactive'
  label: string
  sublabel?: string
}

export default function StatusIndicator({
  status,
  label,
  sublabel
}: StatusIndicatorProps) {
  const statusConfig = {
    active: {
      color: 'bg-green-400',
      text: 'Active',
      border: 'border-green-500/30'
    },
    connected: {
      color: 'bg-cyan-400',
      text: 'Connected',
      border: 'border-cyan-500/30'
    },
    ready: {
      color: 'bg-yellow-400',
      text: 'Ready',
      border: 'border-yellow-500/30'
    },
    inactive: {
      color: 'bg-gray-400',
      text: 'Inactive',
      border: 'border-gray-500/30'
    }
  }

  const config = statusConfig[status]

  return (
    <div className={`glass rounded-xl p-6 border-2 ${config.border}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-3 h-3 rounded-full ${config.color} animate-pulse`}></div>
        <span className="text-sm font-semibold text-white">{config.text}</span>
      </div>
      <div className="text-lg font-bold text-white">{label}</div>
      {sublabel && <div className="text-sm text-gray-400 mt-1">{sublabel}</div>}
    </div>
  )
}