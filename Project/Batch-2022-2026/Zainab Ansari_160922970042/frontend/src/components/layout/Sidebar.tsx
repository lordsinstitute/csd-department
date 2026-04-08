'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  Bot,
  GitCompare,
  Siren,
  TrendingUp,
  Building2,
  Settings,
  Zap,
  Video,
  GraduationCap,
  Network
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/simulation', icon: Activity, label: 'Simulation' },
    { href: '/video-analysis', icon: Video, label: 'Video Analysis', badge: 'NEW' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/agent', icon: Bot, label: 'AI Agent' },
    { href: '/scenarios', icon: GitCompare, label: 'Scenarios' },
    { href: '/emergency', icon: Siren, label: 'Emergency' },
    { href: '/prediction', icon: TrendingUp, label: 'Prediction' },
    { href: '/smart-city', icon: Building2, label: 'Smart City' },
    { href: '/training-console', icon: GraduationCap, label: 'Training Console', badge: 'NEW' },
    { href: '/architecture', icon: Network, label: 'Architecture', badge: 'NEW' },
  ]

  return (
    <aside className="w-64 glass border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="relative">
            <Zap className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NEXUSFLOW
            </h1>
            <p className="text-xs text-gray-400">v2.0.0</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-l-4 border-cyan-400' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 text-xs font-bold bg-cyan-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>SYSTEM ONLINE</span>
            <span className="text-green-400">● LIVE</span>
          </div>
          <div className="flex justify-between">
            <span>WebSocket</span>
            <span className="text-cyan-400">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  )
}