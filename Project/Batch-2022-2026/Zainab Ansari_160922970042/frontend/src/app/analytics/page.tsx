'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { api } from '@/lib/api'

export default function AnalyticsPage() {
  const [rewardData, setRewardData] = useState<any[]>([])
  const [lossData, setLossData] = useState<any[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])

  useEffect(() => {
    loadAnalytics()
    
    const interval = setInterval(loadAnalytics, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadAnalytics = async () => {
    try {
      const stats = await api.getTrainingStats()
      
      // Mock data for demonstration
      const episodes = Array.from({ length: 50 }, (_, i) => ({
        episode: i + 1,
        reward: Math.random() * 1000 - 300 + i * 15,
        loss: Math.max(0.1, 2 - i * 0.03),
        epsilon: Math.max(0.01, 1 - i * 0.02)
      }))
      
      setRewardData(episodes)
      setLossData(episodes)
      
      setComparisonData([
        { metric: 'Wait Time', Manual: 45, AI: 27 },
        { metric: 'Queue', Manual: 8, AI: 5 },
        { metric: 'Throughput', Manual: 120, AI: 162 }
      ])
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-nexus-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Analytics Dashboard" subtitle="Training Performance & Metrics" />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="space-y-6">
            {/* Reward Chart */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Reward per Episode</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rewardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="episode" 
                    stroke="#94a3b8"
                    label={{ value: 'Episode', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    label={{ value: 'Reward', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reward" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Loss and Epsilon Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Training Loss</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="episode" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loss" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Epsilon Decay</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="episode" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 1]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="epsilon" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">AI vs Manual Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="metric" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="Manual" fill="#ef4444" />
                  <Bar dataKey="AI" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Wait Time Reduction</p>
                  <p className="text-2xl font-bold text-green-400">-40%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Queue Reduction</p>
                  <p className="text-2xl font-bold text-green-400">-37.5%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Throughput Increase</p>
                  <p className="text-2xl font-bold text-green-400">+35%</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}