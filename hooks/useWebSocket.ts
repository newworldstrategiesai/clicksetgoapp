import { useState, useEffect } from 'react'

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setSocket(ws)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setSocket(null)
    }

    return () => {
      ws.close()
    }
  }, [url])

  return socket
}

