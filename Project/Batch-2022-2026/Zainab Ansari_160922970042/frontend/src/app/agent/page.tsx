'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Brain, Layers, Zap, Database } from 'lucide-react'
import { api } from '@/lib/api'

export default function AgentPage() {
  const [agentInfo, setAgentInfo] = useState<any>(null)

  useEffect(() => {
    loadAgentInfo()
    
    const interval = setInterval(loadAgentInfo, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadAgentInfo = async () => {
    try {
      const info = await api.getAgentInfo()
      setAgentInfo(info)
    } catch (error) {
      console.error('Error loading agent info:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-nexus-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="AI Agent" subtitle="Deep Q-Network Configuration & Status" />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Parameters */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-cyan-400" />
                  Network Architecture
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Input Layer</span>
                    </div>
                    <span className="text-cyan-400 font-mono">{agentInfo?.state_size || 20} neurons</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Hidden Layer 1</span>
                    </div>
                    <span className="text-cyan-400 font-mono">128 neurons (ReLU)</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Hidden Layer 2</span>
                    </div>
                    <span className="text-cyan-400 font-mono">128 neurons (ReLU)</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Hidden Layer 3</span>
                    </div>
                    <span className="text-cyan-400 font-mono">64 neurons (ReLU)</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Output Layer</span>
                    </div>
                    <span className="text-cyan-400 font-mono">{agentInfo?.action_size || 2} actions</span>
                  </div>
                </div>
              </div>

              {/* Hyperparameters */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Hyperparameters
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Learning Rate (α)</p>
                    <p className="text-2xl font-bold text-white font-mono">{agentInfo?.learning_rate || 0.001}</p>
                  </div>
                  
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Discount Factor (γ)</p>
                    <p className="text-2xl font-bold text-white font-mono">{agentInfo?.gamma || 0.95}</p>
                  </div>
                  
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Epsilon (ε)</p>
                    <p className="text-2xl font-bold text-white font-mono">{agentInfo?.epsilon?.toFixed(3) || '0.050'}</p>
                  </div>
                  
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Batch Size</p>
                    <p className="text-2xl font-bold text-white font-mono">{agentInfo?.batch_size || 64}</p>
                  </div>
                  
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Target Update</p>
                    <p className="text-2xl font-bold text-white font-mono">Every 10 steps</p>
                  </div>
                  
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Memory Size</p>
                    <p className="text-2xl font-bold text-white font-mono">10,000</p>
                  </div>
                </div>
              </div>

              {/* Reward Function */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Reward Function</h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <p className="text-green-400">R = -(waiting_penalty + queue_penalty + change_penalty)</p>
                  <p className="text-gray-400 mt-2">where:</p>
                  <p className="text-cyan-400 ml-4">waiting_penalty = total_waiting_time / 100</p>
                  <p className="text-purple-400 ml-4">queue_penalty = queue_length × 2</p>
                  <p className="text-yellow-400 ml-4">change_penalty = 10 (if phase_time &lt; 5)</p>
                </div>
              </div>
            </div>

            {/* Status Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Training Status
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Episode</p>
                    <p className="text-3xl font-bold text-white">{agentInfo?.episode || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Steps</p>
                    <p className="text-3xl font-bold text-white">{agentInfo?.total_steps || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Memory Buffer</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-white">{agentInfo?.memory_size || 0}</p>
                      <p className="text-sm text-gray-500">/ 10,000</p>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                        style={{ width: `${((agentInfo?.memory_size || 0) / 10000) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Avg Loss (last 100)</p>
                    <p className="text-2xl font-bold text-white">{agentInfo?.avg_loss?.toFixed(4) || '0.0000'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Avg Reward (last 100)</p>
                    <p className="text-2xl font-bold text-white">{agentInfo?.avg_reward?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Model Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Algorithm</span>
                    <span className="text-cyan-400 font-medium">DQN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Optimizer</span>
                    <span className="text-white">Adam</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loss Function</span>
                    <span className="text-white">MSE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Activation</span>
                    <span className="text-white">ReLU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dropout</span>
                    <span className="text-white">0.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}