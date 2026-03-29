'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  data?: any
  message?: string
  timestamp?: string
}

interface UseWebSocketReturn {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: any) => void
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
  connectionStats: {
    connected: boolean
    messageCount: number
    reconnectAttempts: number
  }
}

export function useWebSocket(
  url: string = 'ws://localhost:8000/ws'
): UseWebSocketReturn {

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shouldReconnect = useRef(true)

  const connect = useCallback(() => {

    if (ws.current) {
      ws.current.close()
    }

    try {

      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)
        setReconnectAttempts(0)
      }

      ws.current.onmessage = (event) => {

        try {

          const message = JSON.parse(event.data)

          setLastMessage(message)
          setMessageCount(prev => prev + 1)

          if (
            message.type === 'accident' ||
            message.type === 'emergency_alert'
          ) {
            console.warn('🚨 Alert received:', message)
          }

        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

      ws.current.onclose = () => {

        console.log('🔌 WebSocket disconnected')
        setIsConnected(false)

        if (!shouldReconnect.current) return

        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts),
          30000
        )

        console.log(`⏳ Reconnecting in ${delay}ms...`)

        reconnectTimer.current = setTimeout(() => {

          setReconnectAttempts(prev => prev + 1)
          connect()

        }, delay)

      }

    } catch (error) {
      console.error('Failed to create WebSocket:', error)
    }

  }, [url, reconnectAttempts])

  useEffect(() => {

    connect()

    return () => {

      shouldReconnect.current = false

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }

      if (ws.current) {
        ws.current.close()
      }

    }

  }, [connect])

  const sendMessage = useCallback((message: any) => {

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {

      ws.current.send(JSON.stringify(message))

    } else {

      console.warn('WebSocket not connected')

    }

  }, [])

  const subscribe = useCallback((channel: string) => {

    sendMessage({
      type: 'subscribe',
      channel
    })

    console.log(`📡 Subscribed to ${channel}`)

  }, [sendMessage])

  const unsubscribe = useCallback((channel: string) => {

    sendMessage({
      type: 'unsubscribe',
      channel
    })

    console.log(`📡 Unsubscribed from ${channel}`)

  }, [sendMessage])

  return {

    isConnected,

    lastMessage,

    sendMessage,

    subscribe,

    unsubscribe,

    connectionStats: {
      connected: isConnected,
      messageCount,
      reconnectAttempts
    }

  }
}



/* ------------------------------
   Channel-specific hook
-------------------------------- */

export function useWebSocketChannel(channel: string) {

  const {
    lastMessage,
    subscribe,
    unsubscribe,
    isConnected
  } = useWebSocket()

  const [channelData, setChannelData] = useState<any>(null)

  useEffect(() => {

    if (isConnected) {
      subscribe(channel)
    }

    return () => {
      unsubscribe(channel)
    }

  }, [channel, isConnected, subscribe, unsubscribe])

  useEffect(() => {

    if (lastMessage && lastMessage.type === channel) {
      setChannelData(lastMessage.data)
    }

  }, [lastMessage, channel])

  return channelData
}