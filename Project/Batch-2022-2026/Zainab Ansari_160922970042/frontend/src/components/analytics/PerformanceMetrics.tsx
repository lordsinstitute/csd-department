'use client'

import { Clock, Users, TrendingUp, Zap } from 'lucide-react'

interface PerformanceMetricsProps {
  waitingTime: number
  queueLength: number
  throughput: number
  efficiency: number
}

export default function PerformanceMetrics({
  waitingTime,
  queueLength,
  throughput,
  efficiency
}: PerformanceMetricsProps) {
  const metrics = [
    {
      icon: Clock,
      label: 'Avg Waiting Time',
      value: waitingTime.toFixed(1),
      unit: 's',
      change: '-12%',
      color: 'cyan'
    },
    {
      icon: Users,
      label: 'Avg Queue Length',
      value: queueLength.toFixed(1),
      unit: '',
      change: '-18%',
      color: 'green'
    },
    {
      icon: TrendingUp,
      label: 'Throughput',
      value: throughput.toString(),
      unit: 'veh/h',
      change: '+18%',
      color: 'purple'
    },
    {
      icon: Zap,
      label: 'Efficiency',
      value: efficiency.toFixed(0),
      unit: '%',
      change: '+15%',
      color: 'pink'
    }
  ]

  const colorClasses: Record<string, string> = {
    cyan: 'from-cyan-500 to-cyan-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
    pink: 'from-pink-500 to-pink-700'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => {
        const Icon = metric.icon
        return (
          <div key={i} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[metric.color]} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-green-400">
                {metric.change}
              </div>
            </div>
            
            <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
              {metric.label}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metric.value}</span>
              <span className="text-sm text-gray-500">{metric.unit}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}