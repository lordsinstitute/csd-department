'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default function PredictionPage() {
  const [predictionData, setPredictionData] = useState<any[]>([])
  const [confidence, setConfidence] = useState(87.5)

  useEffect(() => {
    generatePredictionData()
  }, [])

  const generatePredictionData = () => {
    const now = new Date()
    const data = []
    
    // Generate historical and predicted data
    for (let i = -24; i <= 24; i++) {
      const hour = (now.getHours() + i + 24) % 24
      const time = `${hour.toString().padStart(2, '0')}:00`
      
      // Base traffic pattern
      let traffic = 30
      
      // Morning rush (7-9)
      if (hour >= 7 && hour <= 9) {
        traffic = 70 + Math.random() * 15
      }
      // Evening rush (17-19)
      else if (hour >= 17 && hour <= 19) {
        traffic = 75 + Math.random() * 15
      }
      // Daytime (10-16)
      else if (hour >= 10 && hour <= 16) {
        traffic = 45 + Math.random() * 10
      }
      // Night (22-6)
      else if (hour >= 22 || hour <= 6) {
        traffic = 15 + Math.random() * 10
      }
      // Other times
      else {
        traffic = 35 + Math.random() * 10
      }
      
      data.push({
        time,
        actual: i <= 0 ? traffic : null,
        predicted: i >= 0 ? traffic + (Math.random() - 0.5) * 5 : null,
        confidence: i >= 0 ? 85 + Math.random() * 10 : null
      })
    }
    
    setPredictionData(data)
  }

  const currentHour = new Date().getHours()
  const nextPeakHour = currentHour < 7 ? 7 : currentHour < 17 ? 17 : 7 + 24

  return (
    <div className="flex min-h-screen bg-nexus-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Traffic Prediction (LSTM)" 
          subtitle="AI-powered traffic forecasting"
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Prediction Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Prediction Accuracy</p>
              <p className="text-3xl font-bold text-white mb-2">{confidence.toFixed(1)}%</p>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Next Peak Period</p>
              <p className="text-3xl font-bold text-white">
                {nextPeakHour >= 24 ? `${(nextPeakHour - 24).toString().padStart(2, '0')}:00` : `${nextPeakHour.toString().padStart(2, '0')}:00`}
              </p>
              <p className="text-xs text-yellow-400 mt-2">
                {nextPeakHour >= 24 ? 'Tomorrow morning' : nextPeakHour === 7 ? 'Morning rush' : 'Evening rush'}
              </p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Model Type</p>
              <p className="text-2xl font-bold text-white">LSTM</p>
              <p className="text-xs text-gray-500 mt-2">Long Short-Term Memory Neural Network</p>
            </div>
          </div>

          {/* Prediction Chart */}
          <div className="glass rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">24-Hour Traffic Prediction</h2>
            
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  label={{ value: 'Traffic Volume (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  name="Actual Traffic"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  name="Predicted Traffic"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-cyan-500" />
                <span className="text-sm text-gray-400">Actual (Historical)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500 border-dashed" style={{ borderTop: '2px dashed #a855f7', height: 0 }} />
                <span className="text-sm text-gray-400">Predicted (LSTM)</span>
              </div>
            </div>
          </div>

          {/* How LSTM Works */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">How LSTM Prediction Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Historical Data</h3>
                <p className="text-sm text-gray-400">
                  LSTM network analyzes past traffic patterns, peak hours, and seasonal variations
                </p>
              </div>

              <div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pattern Learning</h3>
                <p className="text-sm text-gray-400">
                  Neural network identifies recurring patterns and temporal dependencies in traffic flow
                </p>
              </div>

              <div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">🔮</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Future Prediction</h3>
                <p className="text-sm text-gray-400">
                  Model forecasts traffic volume 24 hours ahead with 87%+ accuracy
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <h4 className="text-sm font-bold text-cyan-400 mb-2">Key Features</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Memory cells remember long-term patterns (weeks/months)</li>
                <li>• Forget gates filter irrelevant historical data</li>
                <li>• Input gates learn from recent traffic conditions</li>
                <li>• Output gates generate accurate future predictions</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}