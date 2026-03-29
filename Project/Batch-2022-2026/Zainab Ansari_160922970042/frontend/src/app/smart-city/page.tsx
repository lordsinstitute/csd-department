'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { 
  MapPin, 
  Car, 
  Leaf, 
  Clock, 
  Siren, 
  TrendingUp, 
  DollarSign, 
  Users,
  Building2,
  Activity,
  Zap,
  CheckCircle
} from 'lucide-react'

export default function SmartCityPage() {
  const [cityMetrics] = useState({
    intersections_controlled: 32,
    vehicles_managed_today: 125430,
    co2_reduction_tons: 15.4,
    avg_commute_improvement: -18,
    emergency_response_improvement: 42,
    total_cost_savings: 2340000,
    fuel_saved_liters: 8200,
    air_quality_index: 85,
    citizen_satisfaction: 82,
    system_reliability: 99.2
  })

  const [liveStats, setLiveStats] = useState({
    active_vehicles: 4200,
    current_incidents: 0,
    signals_optimized: 28,
    average_speed: 35
  })

  // Use ref to prevent infinite loop
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      setLiveStats({
        active_vehicles: 4200 + Math.floor(Math.random() * 500),
        current_incidents: Math.floor(Math.random() * 5),
        signals_optimized: 28 + Math.floor(Math.random() * 4),
        average_speed: 35 + Math.random() * 10
      })
    }, 2000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, []) // Empty dependency array - only run once on mount

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Smart City Control Center" subtitle="City-wide Traffic Management Overview" />

        <main className="flex-1 p-8 overflow-auto">
          
          {/* City Overview */}
          <div className="mb-8 glass rounded-xl p-6 border-2 border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Building2 className="w-6 h-6 mr-3 text-cyan-400" />
                City Infrastructure
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-400">OPERATIONAL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <CityMetricCard
                icon={<MapPin className="w-8 h-8 text-blue-400" />}
                value={cityMetrics.intersections_controlled}
                label="Intersections Controlled"
                color="blue"
              />
              <CityMetricCard
                icon={<Car className="w-8 h-8 text-green-400" />}
                value={cityMetrics.vehicles_managed_today.toLocaleString()}
                label="Vehicles Managed Today"
                color="green"
              />
              <CityMetricCard
                icon={<Activity className="w-8 h-8 text-purple-400" />}
                value={`${cityMetrics.system_reliability}%`}
                label="System Reliability"
                color="purple"
                trend={99.2}
              />
              <CityMetricCard
                icon={<Users className="w-8 h-8 text-orange-400" />}
                value={`${cityMetrics.citizen_satisfaction}%`}
                label="Citizen Satisfaction"
                color="orange"
                trend={82}
              />
            </div>
          </div>

          {/* Live Statistics */}
          <div className="mb-8 glass rounded-xl p-6 border-2 border-green-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-green-400" />
              Live City Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <LiveStatCard
                label="Active Vehicles"
                value={liveStats.active_vehicles.toLocaleString()}
                icon="🚗"
                color="blue"
              />
              <LiveStatCard
                label="Current Incidents"
                value={liveStats.current_incidents}
                icon="⚠️"
                color={liveStats.current_incidents > 2 ? 'red' : 'green'}
              />
              <LiveStatCard
                label="Signals Optimized"
                value={`${liveStats.signals_optimized}/32`}
                icon="🚦"
                color="purple"
              />
              <LiveStatCard
                label="Average Speed"
                value={`${liveStats.average_speed.toFixed(1)} km/h`}
                icon="⚡"
                color="orange"
              />
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="mb-8 glass rounded-xl p-6 border-2 border-green-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Leaf className="w-6 h-6 mr-3 text-green-400" />
              Environmental Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImpactCard
                icon={<Leaf className="w-12 h-12 text-green-400" />}
                title="CO₂ Reduction"
                value={`${cityMetrics.co2_reduction_tons} tons`}
                subtitle="This month"
                color="green"
                progress={65}
              />
              <ImpactCard
                icon={<Car className="w-12 h-12 text-blue-400" />}
                title="Fuel Saved"
                value={`${cityMetrics.fuel_saved_liters.toLocaleString()} L`}
                subtitle="This month"
                color="blue"
                progress={72}
              />
              <ImpactCard
                icon={<Activity className="w-12 h-12 text-purple-400" />}
                title="Air Quality Index"
                value={cityMetrics.air_quality_index}
                subtitle="Good"
                color="purple"
                progress={cityMetrics.air_quality_index}
              />
            </div>
          </div>

          {/* Economic Impact */}
          <div className="mb-8 glass rounded-xl p-6 border-2 border-yellow-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-yellow-400" />
              Economic Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EconomicCard
                title="Annual Cost Savings"
                value={`$${(cityMetrics.total_cost_savings / 1000000).toFixed(1)}M`}
                breakdown={[
                  { label: 'Reduced congestion', value: '$1.2M' },
                  { label: 'Fuel savings', value: '$890K' },
                  { label: 'Maintenance reduction', value: '$250K' }
                ]}
                color="green"
              />
              <EconomicCard
                title="Productivity Gains"
                value={`${Math.abs(cityMetrics.avg_commute_improvement)}% faster`}
                breakdown={[
                  { label: 'Average commute time', value: '-18%' },
                  { label: 'Emergency response time', value: `-${cityMetrics.emergency_response_improvement}%` },
                  { label: 'Delivery efficiency', value: '+25%' }
                ]}
                color="blue"
              />
            </div>
          </div>

          {/* Social Impact */}
          <div className="glass rounded-xl p-6 border-2 border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-purple-400" />
              Social Impact
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SocialMetric
                icon={<Clock className="w-6 h-6" />}
                label="Time Saved"
                value="12 min/trip"
                color="blue"
              />
              <SocialMetric
                icon={<Siren className="w-6 h-6" />}
                label="Emergency Response"
                value="-42% faster"
                color="red"
              />
              <SocialMetric
                icon={<TrendingUp className="w-6 h-6" />}
                label="Traffic Flow"
                value="+35% better"
                color="green"
              />
              <SocialMetric
                icon={<CheckCircle className="w-6 h-6" />}
                label="Accident Reduction"
                value="-28%"
                color="purple"
              />
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

// Component definitions remain the same
function CityMetricCard({ icon, value, label, color, trend }: {
  icon: React.ReactNode
  value: string | number
  label: string
  color: string
  trend?: number
}) {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30'
  }

  return (
    <div className={`p-6 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {trend !== undefined && (
        <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              color === 'blue' ? 'bg-blue-500' :
              color === 'green' ? 'bg-green-500' :
              color === 'purple' ? 'bg-purple-500' :
              'bg-orange-500'
            }`}
            style={{ width: `${trend}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

function LiveStatCard({ label, value, icon, color }: {
  label: string
  value: string | number
  icon: string
  color: string
}) {
  const colors = {
    blue: 'border-blue-500/50 bg-blue-500/5',
    green: 'border-green-500/50 bg-green-500/5',
    red: 'border-red-500/50 bg-red-500/5',
    purple: 'border-purple-500/50 bg-purple-500/5',
    orange: 'border-orange-500/50 bg-orange-500/5'
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[color as keyof typeof colors]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

function ImpactCard({ icon, title, value, subtitle, color, progress }: {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  color: string
  progress: number
}) {
  const colors = {
    green: 'border-green-500/30 bg-green-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5'
  }

  const progressColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className={`p-6 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
      </div>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 mb-3">{subtitle}</div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${progressColors[color as keyof typeof progressColors]}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

function EconomicCard({ title, value, breakdown, color }: {
  title: string
  value: string
  breakdown: Array<{ label: string; value: string }>
  color: string
}) {
  const colors = {
    green: 'border-green-500/30 bg-green-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5'
  }

  return (
    <div className={`p-6 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <div className="text-sm text-gray-400 mb-2">{title}</div>
      <div className="text-4xl font-bold text-white mb-6">{value}</div>
      <div className="space-y-3">
        {breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{item.label}</span>
            <span className="text-sm font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SocialMetric({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  const colors = {
    blue: 'text-blue-400',
    red: 'text-red-400',
    green: 'text-green-400',
    purple: 'text-purple-400'
  }

  return (
    <div className="p-4 glass rounded-lg border border-gray-700">
      <div className={`mb-2 ${colors[color as keyof typeof colors]}`}>
        {icon}
      </div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}