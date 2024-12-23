import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, MessageSquare, PhoneOff } from 'lucide-react'
import { Call } from '@/types/Call'

interface CallDetailProps {
  call: Call
  onCallAction: (action: string, callId: string) => void
}

export function CallDetail({ call, onCallAction }: CallDetailProps) {
  const [isListening, setIsListening] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (isListening && audioRef.current) {
      // For mock data, we'll just use a sample audio file
      audioRef.current.src = '/sample-audio.mp3'
      audioRef.current.play()
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [isListening, call.id])

  const handleAction = (action: string) => {
    onCallAction(action, call.id)
  }

  return (
    <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Call Details</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="font-semibold">Agent:</p>
          <p>{call.agentName}</p>
        </div>
        <div>
          <p className="font-semibold">Customer:</p>
          <p>{call.customerName}</p>
        </div>
        <div>
          <p className="font-semibold">Duration:</p>
          <p>{formatDuration(call.duration)}</p>
        </div>
        <div>
          <p className="font-semibold">Status:</p>
          <p className={getStatusColor(call.status)}>{call.status}</p>
        </div>
        <div>
          <p className="font-semibold">Call ID:</p>
          <p>{call.id}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Live Audio</h3>
        <button
          className={`px-4 py-2 rounded-md ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
          onClick={() => setIsListening(!isListening)}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
        <audio ref={audioRef} className="hidden" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => handleAction('mute-agent')}
        >
          <MicOff className="mr-2" size={18} />
          Mute Agent
        </button>
        <button
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => handleAction('mute-customer')}
        >
          <MicOff className="mr-2" size={18} />
          Mute Customer
        </button>
        <button
          className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          onClick={() => handleAction('whisper')}
        >
          <MessageSquare className="mr-2" size={18} />
          Whisper
        </button>
        <button
          className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={() => handleAction('barge-in')}
        >
          <Mic className="mr-2" size={18} />
          Barge-In
        </button>
        <button
          className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors col-span-2 md:col-span-4"
          onClick={() => handleAction('end-call')}
        >
          <PhoneOff className="mr-2" size={18} />
          End Call
        </button>
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600'
    case 'on hold':
      return 'text-yellow-600'
    case 'muted':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

