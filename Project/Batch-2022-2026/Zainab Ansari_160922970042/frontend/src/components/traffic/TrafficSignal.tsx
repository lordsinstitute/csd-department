'use client'

import { useEffect, useState } from 'react'

interface TrafficSignalProps {
  phase: 'NS_GREEN' | 'EW_GREEN'
  countdown?: number
}

export default function TrafficSignal({ phase, countdown = 0 }: TrafficSignalProps) {

  const [timeLeft, setTimeLeft] = useState(countdown)

  useEffect(() => {

    if (!countdown) return

    setTimeLeft(countdown)

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)

  }, [countdown])

  const nsGreen = phase === 'NS_GREEN'
  const ewGreen = phase === 'EW_GREEN'

  return (

    <div className="glass rounded-xl p-6 border-2 border-yellow-500/30">

      {/* Title */}

      <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🚦 Traffic Signal Controller
      </div>

      {/* Signals */}

      <div className="grid grid-cols-2 gap-6">

        {/* NORTH SOUTH */}

        <SignalLight
          label="North / South"
          active={nsGreen}
        />

        {/* EAST WEST */}

        <SignalLight
          label="East / West"
          active={ewGreen}
        />

      </div>

      {/* Phase Info */}

      <div className="mt-4 text-center">

        <div className="text-sm text-gray-400">
          Current Phase
        </div>

        <div className="text-xl font-bold text-green-400">

          {nsGreen ? 'North / South GREEN' : 'East / West GREEN'}

        </div>

      </div>

      {/* Countdown */}

      {countdown > 0 && (

        <div className="mt-3 text-center">

          <div className="text-xs text-gray-400">
            Next Switch In
          </div>

          <div className="text-lg font-bold text-yellow-400">
            {timeLeft}s
          </div>

        </div>

      )}

    </div>

  )
}



function SignalLight({ label, active }: { label: string; active: boolean }) {

  return (

    <div className="flex flex-col items-center">

      <div className="text-sm text-gray-400 mb-3">
        {label}
      </div>

      <div className="bg-gray-900 rounded-xl p-3 flex flex-col gap-2">

        {/* RED */}

        <Light
          color="red"
          active={!active}
        />

        {/* YELLOW */}

        <Light
          color="yellow"
          active={false}
        />

        {/* GREEN */}

        <Light
          color="green"
          active={active}
        />

      </div>

    </div>

  )
}



function Light({
  color,
  active
}: {
  color: 'red' | 'yellow' | 'green'
  active: boolean
}) {

  const colors = {
    red: active ? 'bg-red-500 animate-pulse' : 'bg-red-900',
    yellow: active ? 'bg-yellow-400 animate-pulse' : 'bg-yellow-900',
    green: active ? 'bg-green-500 animate-pulse' : 'bg-green-900'
  }

  return (
    <div
      className={`w-6 h-6 rounded-full ${colors[color]} transition-all duration-300`}
    />
  )
}