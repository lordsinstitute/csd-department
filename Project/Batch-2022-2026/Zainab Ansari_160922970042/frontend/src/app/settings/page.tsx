'use client'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-nexus-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Settings" subtitle="System configuration" />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">System Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">SUMO GUI</label>
                <div className="flex items-center gap-3">
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                  <span className="text-sm text-gray-400">Enable visualization</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Auto-save Models</label>
                <div className="flex items-center gap-3">
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-cyan-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                  <span className="text-sm text-gray-400">Save every 10 episodes</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Max Episodes</label>
                <input
                  type="number"
                  defaultValue="100"
                  className="glass px-4 py-2 rounded-lg text-white w-32"
                />
              </div>

              <button className="gradient-cyan px-6 py-3 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                Save Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}