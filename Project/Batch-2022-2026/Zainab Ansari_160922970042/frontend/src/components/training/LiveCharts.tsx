'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface LiveChartsProps {
  data: {
    episodes: number[]
    rewards: number[]
    losses: number[]
    epsilon: number[]
  }
}

export default function LiveCharts({ data }: LiveChartsProps) {
  // Transform data for recharts
  const chartData = data.episodes.map((episode, idx) => ({
    episode,
    reward: data.rewards[idx],
    loss: data.losses[idx],
    epsilon: data.epsilon[idx]
  }))

  return (
    <div className="space-y-6">
      {/* Reward Chart */}
      <div className="glass rounded-xl p-6 border-2 border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Episode Rewards</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="episode" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="reward" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Loss Chart */}
      <div className="glass rounded-xl p-6 border-2 border-red-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Training Loss</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="episode" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Epsilon Chart */}
      <div className="glass rounded-xl p-6 border-2 border-purple-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Epsilon Decay</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="episode" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 1]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="epsilon" stroke="#a855f7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}