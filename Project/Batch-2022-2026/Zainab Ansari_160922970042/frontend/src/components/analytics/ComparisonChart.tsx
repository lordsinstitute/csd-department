'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ComparisonChartProps {
  data: any[]
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">AI vs Manual Control Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Legend />
          <Bar dataKey="Manual" fill="#ef4444" name="Manual (Fixed)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="AI" fill="#10b981" name="AI (DQN)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-6 grid grid-cols-3 gap-4">
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
  )
}