'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RewardChartProps {
  data: any[]
}

export default function RewardChart({ data }: RewardChartProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Cumulative Reward per Episode</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="episode" 
            stroke="#94a3b8"
            label={{ value: 'Episode', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
          />
          <YAxis 
            stroke="#94a3b8"
            label={{ value: 'Total Reward', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="reward" 
            stroke="#06b6d4" 
            strokeWidth={2}
            name="Reward"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}