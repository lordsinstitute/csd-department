'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚦</div>
        <h1 className="text-4xl font-bold mb-2">NexusFlow</h1>
        <p className="text-gray-400">Loading Traffic Operations Center...</p>
      </div>
    </div>
  )
}