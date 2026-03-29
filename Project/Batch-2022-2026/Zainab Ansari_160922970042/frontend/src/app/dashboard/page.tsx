'use client'

import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Video, Brain, BarChart3, Activity } from 'lucide-react'

export default function DashboardPage() {

  const router = useRouter()

  function openVideoMode() {
    router.push('/video-analysis')
  }

  function openTraining() {
    router.push('/training')
  }

  function openAnalytics() {
    router.push('/analytics')
  }

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header
          title="AI Traffic Control Dashboard"
          subtitle="Smart City Traffic Management System"
        />

        <main className="p-8 flex-1 overflow-auto">

          {/* System Overview */}

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <Metric title="Active Cameras" value="4" icon="📹" />
            <Metric title="Vehicles Detected" value="132" icon="🚗" />
            <Metric title="AI Efficiency" value="87%" icon="🤖" />
            <Metric title="Avg Wait Time" value="14s" icon="⏱️" />

          </div>

          {/* Main Modes */}

          <div className="grid md:grid-cols-3 gap-6">

            {/* Video Mode */}

            <div
              onClick={openVideoMode}
              className="cursor-pointer glass p-8 rounded-xl border border-cyan-500/40 hover:border-cyan-400 transition"
            >

              <div className="flex flex-col items-center text-center">

                <Video className="w-12 h-12 text-cyan-400 mb-4" />

                <h3 className="text-xl font-bold text-white mb-2">
                  Video Analysis
                </h3>

                <p className="text-gray-400 text-sm mb-4">
                  Upload traffic video and run YOLOv8 detection with AI signal optimization.
                </p>

                <div className="px-4 py-2 bg-cyan-600 rounded-lg text-white text-sm">
                  Start Analysis
                </div>

              </div>

            </div>

            {/* RL Training */}

            <div
              onClick={openTraining}
              className="cursor-pointer glass p-8 rounded-xl border border-purple-500/40 hover:border-purple-400 transition"
            >

              <div className="flex flex-col items-center text-center">

                <Brain className="w-12 h-12 text-purple-400 mb-4" />

                <h3 className="text-xl font-bold text-white mb-2">
                  RL Training
                </h3>

                <p className="text-gray-400 text-sm mb-4">
                  Train reinforcement learning agent for traffic signal optimization.
                </p>

                <div className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm">
                  Open Console
                </div>

              </div>

            </div>

            {/* Analytics */}

            <div
              onClick={openAnalytics}
              className="cursor-pointer glass p-8 rounded-xl border border-green-500/40 hover:border-green-400 transition"
            >

              <div className="flex flex-col items-center text-center">

                <BarChart3 className="w-12 h-12 text-green-400 mb-4" />

                <h3 className="text-xl font-bold text-white mb-2">
                  Traffic Analytics
                </h3>

                <p className="text-gray-400 text-sm mb-4">
                  View traffic performance metrics and system insights.
                </p>

                <div className="px-4 py-2 bg-green-600 rounded-lg text-white text-sm">
                  View Analytics
                </div>

              </div>

            </div>

          </div>

          {/* System Status */}

          <div className="mt-10 glass p-6 rounded-xl border border-blue-500/40">

            <h3 className="text-lg font-bold text-white mb-4 flex items-center">

              <Activity className="w-5 h-5 mr-2 text-blue-400" />

              System Status

            </h3>

            <div className="grid md:grid-cols-3 gap-4">

              <Status label="YOLOv8 Detection" status="Active" />
              <Status label="RL Optimization" status="Ready" />
              <Status label="WebSocket Streaming" status="Connected" />

            </div>

          </div>

        </main>

      </div>

    </div>

  )
}

function Metric({ title, value, icon }: any) {

  return (

    <div className="glass p-6 rounded-xl border border-gray-700">

      <div className="text-2xl mb-2">{icon}</div>

      <div className="text-sm text-gray-400">{title}</div>

      <div className="text-2xl font-bold text-white">{value}</div>

    </div>

  )

}

function Status({ label, status }: any) {

  return (

    <div className="flex items-center justify-between bg-gray-800/40 p-3 rounded-lg border border-gray-700">

      <span className="text-gray-300 text-sm">
        {label}
      </span>

      <span className="text-green-400 text-sm font-semibold">
        {status}
      </span>

    </div>

  )

}