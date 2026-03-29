'use client'

import { Bell, Settings as SettingsIcon } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-auto border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-md px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative glass p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          <button className="glass p-2 rounded-lg hover:bg-white/10 transition-colors">
            <SettingsIcon className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="flex items-center gap-3 glass px-4 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-cyan flex items-center justify-center">
              <span className="text-sm font-bold">AD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-500">System Control</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full System Name */}
      <div className="text-xs text-gray-500 italic">
        NexusFlow: Adaptive Deep Reinforcement Learning Traffic Optimization System
      </div>
    </header>
  )
}