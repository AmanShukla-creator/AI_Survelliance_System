import { useEffect, useState } from 'react'
import { Video, AlertTriangle } from 'lucide-react'

export default function VideoStream() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/video_feed', { method: 'HEAD' })
        if (response.ok) {
          setIsConnected(true)
          setError(null)
        }
      } catch {
        setError('Cannot connect to backend')
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-panel glow-green p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 neon-green" />
          <h2 className="text-xl font-bold text-slate-100">Live Feed</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={isConnected ? 'neon-green text-sm' : 'text-red-400 text-sm'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error ? (
        <div className="flex-1 rounded-lg flex items-center justify-center border border-red-500/30" style={{ backgroundColor: '#111827' }}>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
            <p className="text-slate-400 text-sm mt-2">Make sure backend is running on port 5000</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 rounded-lg overflow-hidden bg-gray-900 border border-emerald-500/30">
          <img
            src="http://localhost:5000/video_feed"
            alt="Live surveillance feed"
            className="w-full h-full object-cover"
            onError={() => {
              setError('Failed to load video stream')
              setIsConnected(false)
            }}
          />
        </div>
      )}
    </div>
  )
}