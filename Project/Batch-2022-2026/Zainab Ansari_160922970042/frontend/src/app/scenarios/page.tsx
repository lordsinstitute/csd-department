// frontend/src/app/scenarios/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { api } from '@/lib/api'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

interface ScenarioData {
  name: string
  avgWaitTime: number
  throughput: number
  queueReduction: number
  co2Saved: number
  color: string
  icon: string
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([
    {
      name: 'Fixed-Time Signals',
      avgWaitTime: 45.2,
      throughput: 980,
      queueReduction: 0,
      co2Saved: 0,
      color: 'red',
      icon: '🔴'
    },
    {
      name: 'Actuated Signals',
      avgWaitTime: 38.7,
      throughput: 1120,
      queueReduction: 14.4,
      co2Saved: 2.1,
      color: 'yellow',
      icon: '🟡'
    },
    {
      name: 'AI-Optimized (DQN)',
      avgWaitTime: 24.5,
      throughput: 1420,
      queueReduction: 45.8,
      co2Saved: 8.9,
      color: 'green',
      icon: '🟢'
    },
    {
      name: 'DQN + Emergency Priority',
      avgWaitTime: 22.1,
      throughput: 1520,
      queueReduction: 51.1,
      co2Saved: 11.2,
      color: 'cyan',
      icon: '🔵'
    }
  ])

  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([
    'Fixed-Time Signals',
    'AI-Optimized (DQN)'
  ])

  const toggleScenario = (name: string) => {
    if (selectedScenarios.includes(name)) {
      setSelectedScenarios(selectedScenarios.filter(s => s !== name))
    } else {
      setSelectedScenarios([...selectedScenarios, name])
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
      yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' }
    }
    return colors[color] || colors.green
  }

  const selectedData = scenarios.filter(s => selectedScenarios.includes(s.name))
  const baseline = scenarios[0] // Fixed-Time as baseline

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Scenario Testing & Comparison" 
          subtitle="Multi-scenario performance analysis"
        />

        <main className="flex-1 p-8 overflow-auto">
          {/* Scenario Selector */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Select Scenarios to Compare</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scenarios.map((scenario) => {
                const colors = getColorClasses(scenario.color)
                const isSelected = selectedScenarios.includes(scenario.name)
                
                return (
                  <button
                    key={scenario.name}
                    onClick={() => toggleScenario(scenario.name)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.border} scale-105 shadow-lg`
                        : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{scenario.icon}</span>
                      {isSelected && (
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className={`text-sm font-semibold ${isSelected ? colors.text : 'text-gray-400'}`}>
                      {scenario.name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Performance Comparison Table */}
          <div className="mb-8 glass rounded-xl p-6 border-2 border-cyan-500/30 overflow-x-auto">
            <h2 className="text-xl font-bold text-white mb-6">Performance Across Traffic Scenarios</h2>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">Scenario</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">Manual Wait</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">AI Wait</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">Improvement</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">Queue Reduction</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">CO₂ Saved</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.map((scenario) => {
                  const colors = getColorClasses(scenario.color)
                  const improvement = ((baseline.avgWaitTime - scenario.avgWaitTime) / baseline.avgWaitTime * 100).toFixed(1)
                  
                  return (
                    <tr key={scenario.name} className={`border-b border-gray-800 ${colors.bg}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{scenario.icon}</span>
                          <span className={`font-semibold ${colors.text}`}>{scenario.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="text-2xl font-bold text-white">{baseline.avgWaitTime}s</div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="text-2xl font-bold text-white">{scenario.avgWaitTime}s</div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className={`flex items-center justify-center space-x-2 ${
                          parseFloat(improvement) > 0 ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {parseFloat(improvement) > 0 && <TrendingDown className="w-5 h-5" />}
                          <span className="text-xl font-bold">{improvement}%</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="text-xl font-bold text-white">{scenario.queueReduction}%</div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="text-xl font-bold text-green-400">{scenario.co2Saved}kg</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Visual Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Wait Time Comparison */}
            <div className="glass rounded-xl p-6 border-2 border-blue-500/30">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Average Wait Time Comparison
              </h3>
              
              <div className="space-y-4">
                {selectedData.map((scenario) => {
                  const colors = getColorClasses(scenario.color)
                  const percentage = (scenario.avgWaitTime / baseline.avgWaitTime) * 100
                  
                  return (
                    <div key={scenario.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span>{scenario.icon}</span>
                          <span className={`text-sm font-semibold ${colors.text}`}>
                            {scenario.name}
                          </span>
                        </div>
                        <span className="text-white font-bold">{scenario.avgWaitTime}s</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            scenario.color === 'red' ? 'bg-red-500' :
                            scenario.color === 'yellow' ? 'bg-yellow-500' :
                            scenario.color === 'green' ? 'bg-green-500' :
                            'bg-cyan-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Throughput Comparison */}
            <div className="glass rounded-xl p-6 border-2 border-green-500/30">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Throughput Comparison
              </h3>
              
              <div className="space-y-4">
                {selectedData.map((scenario) => {
                  const colors = getColorClasses(scenario.color)
                  const maxThroughput = Math.max(...scenarios.map(s => s.throughput))
                  const percentage = (scenario.throughput / maxThroughput) * 100
                  
                  return (
                    <div key={scenario.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span>{scenario.icon}</span>
                          <span className={`text-sm font-semibold ${colors.text}`}>
                            {scenario.name}
                          </span>
                        </div>
                        <span className="text-white font-bold">{scenario.throughput} veh/h</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            scenario.color === 'red' ? 'bg-red-500' :
                            scenario.color === 'yellow' ? 'bg-yellow-500' :
                            scenario.color === 'green' ? 'bg-green-500' :
                            'bg-cyan-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6 border-2 border-green-500/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Best Wait Time</div>
                  <div className="text-2xl font-bold text-white">
                    {Math.min(...selectedData.map(s => s.avgWaitTime))}s
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {selectedData.find(s => s.avgWaitTime === Math.min(...selectedData.map(d => d.avgWaitTime)))?.name}
              </div>
            </div>

            <div className="glass rounded-xl p-6 border-2 border-cyan-500/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Best Throughput</div>
                  <div className="text-2xl font-bold text-white">
                    {Math.max(...selectedData.map(s => s.throughput))}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {selectedData.find(s => s.throughput === Math.max(...selectedData.map(d => d.throughput)))?.name}
              </div>
            </div>

            <div className="glass rounded-xl p-6 border-2 border-purple-500/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total CO₂ Saved</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedData.reduce((sum, s) => sum + s.co2Saved, 0).toFixed(1)}kg
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Across all selected scenarios
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}