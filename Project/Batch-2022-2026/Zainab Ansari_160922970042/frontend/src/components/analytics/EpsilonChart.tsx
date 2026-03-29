'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EpsilonChartProps {
  data: any[]
}

export default function EpsilonChart({ data }: EpsilonChartProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Epsilon Decay</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="episode" 
            stroke="#94a3b8"
            label={{ value: 'Episode', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
          />
          <YAxis 
            stroke="#94a3b8"
            domain={[0, 1]}
            label={{ value: 'Epsilon (ε)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
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
            dataKey="epsilon" 
            stroke="#a855f7" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}