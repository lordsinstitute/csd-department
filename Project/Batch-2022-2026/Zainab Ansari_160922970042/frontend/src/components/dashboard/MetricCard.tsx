import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
  subtitle?: string
  color: 'red' | 'green' | 'blue' | 'purple' | 'yellow' | 'orange' | 'cyan'
}

export default function MetricCard({
  title,
  value,
  change,
  icon,
  trend,
  subtitle,
  color
}: MetricCardProps) {
  const colors = {
    red: 'border-red-500/30 bg-red-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    blue: 'border-blue-500/30 bg-blue-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
    yellow: 'border-yellow-500/30 bg-yellow-500/10',
    orange: 'border-orange-500/30 bg-orange-500/10',
    cyan: 'border-cyan-500/30 bg-cyan-500/10'
  }

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  }

  return (
    <div className={`glass rounded-xl p-6 border-2 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400">{icon}</div>
        <div className={`text-sm font-semibold ${trendColors[trend]}`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}