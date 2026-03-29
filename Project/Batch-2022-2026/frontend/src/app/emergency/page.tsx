'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { api } from '@/lib/api'
import { Siren, Clock, CheckCircle, AlertCircle } from 'lucide-react'  // Changed from Ambulance

export default function EmergencyPage() {
  const [events, setEvents] = useState<any[]>([])
  const [stats, setStats] = useState({
    total_events: 0,
    avg_time_saved: 45,
    success_rate: 98.5,
    active_overrides: 0
  })

  useEffect(() => {
    loadEmergencyData()
    const interval = setInterval(loadEmergencyData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadEmergencyData = async () => {
    try {
      const data = await api.getEmergencyEvents()
      setEvents(data.events || [])
      setStats(prev => ({
        ...prev,
        total_events: data.count || 0
      }))
    } catch (error) {
      console.error('Error loading emergency data:', error)
    }
  }

  const handleTriggerEmergency = async () => {
    try {
      const result = await api.handleEmergencyVehicle(
        `EMG_${Date.now()}`,
        'north_0'
      )
      console.log('Emergency triggered:', result)
      loadEmergencyData()
    } catch (error) {
      console.error('Error triggering emergency:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-nexus-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Emergency Vehicle Priority System" 
          subtitle="Real-time emergency response optimization"
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                  <Siren className="w-6 h-6 text-white" />  {/* Changed */}
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Events</p>
              <p className="text-3xl font-bold text-white">{stats.total_events}</p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Avg Time Saved</p>
              <p className="text-3xl font-bold text-white">{stats.avg_time_saved}s</p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-white">{stats.success_rate}%</p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Active Overrides</p>
              <p className="text-3xl font-bold text-white">{stats.active_overrides}</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="glass rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Emergency Vehicle Detection & Response</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚨</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Detection</h3>
                <p className="text-sm text-gray-400">
                  Emergency vehicle detected via sensors or GPS signal approaching intersection
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Override Signal</h3>
                <p className="text-sm text-gray-400">
                  AI immediately overrides current signal timing and creates green corridor
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Path Cleared</h3>
                <p className="text-sm text-gray-400">
                  Emergency vehicle passes safely, system logs event and resumes normal operation
                </p>
              </div>
            </div>
          </div>

          {/* Test Emergency */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Test Emergency Response</h3>
                <p className="text-sm text-gray-400">Simulate emergency vehicle detection</p>
              </div>
              <button
                onClick={handleTriggerEmergency}
                className="gradient-cyan px-6 py-3 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
              >
                <Siren className="w-5 h-5" />  {/* Changed */}
                Trigger Emergency
              </button>
            </div>
          </div>

          {/* Event Log */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Emergency Events</h3>
            
            {events.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400">No emergency events recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(-10).reverse().map((event, i) => (
                  <div key={i} className="glass rounded-lg p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <Siren className="w-5 h-5 text-red-400" />  {/* Changed */}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white">{event.vehicle_id}</h4>
                          <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          Approach: <span className="text-cyan-400">{event.approach_lane}</span>
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {event.status}
                          </span>
                          <span className="text-purple-400">
                            Est. Time Saved: 45s
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}