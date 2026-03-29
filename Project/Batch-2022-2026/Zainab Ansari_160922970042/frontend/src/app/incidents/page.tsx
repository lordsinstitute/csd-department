'use client'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function IncidentsPage() {
  return (
    <div className="flex min-h-screen bg-nexus-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Incidents" subtitle="Active incidents and alerts" />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-center flex-col py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">All Clear</h2>
              <p className="text-gray-400">No active incidents detected</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}