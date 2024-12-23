'use client'

import { useState, useEffect } from 'react'
import { CallList } from '@/components/admin/CallList'
import { CallDetail } from '@/components/admin/CallDetail'
import { SearchBar } from '@/components/admin/SearchBar'
import { Call } from '@/types/Call'

export default function LiveCallMonitor() {
  const [calls, setCalls] = useState<Call[]>([])
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data from vapilog.json
  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await fetch('/data/vapilog.json');
        const data = await response.json();
        const formattedData: Call[] = data.map((log: any) => ({
          id: log.id,
          agentName: log.agentName || 'Unknown Agent', // You may want to parse this based on the actual structure
          customerName: log.customer?.name || 'Unknown Customer',
          duration: log.duration || 0,
          status: log.status || 'queued',
          startedAt: log.startedAt,
          endedAt: log.endedAt,
          phoneCallProvider: log.phoneCallProvider,
          phoneCallTransport: log.phoneCallTransport,
          cost: log.cost || 0,
          costBreakdown: log.costBreakdown,
        }));
        setCalls(formattedData);
      } catch (error) {
        console.error("Failed to fetch call logs:", error);
      }
    };

    fetchCallLogs();

    // Simulate real-time updates for call duration
    const interval = setInterval(() => {
      setCalls(prevCalls => 
        prevCalls.map(call => ({
          ...call,
          duration: call.duration + 1  // Simulating the duration of the call
        }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Filter calls based on search term
  const filteredCalls = calls.filter(call => 
    call.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle call actions (mute, end)
  const handleCallAction = (action: string, callId: string) => {
    setCalls(prevCalls => 
      prevCalls.map(call => {
        if (call.id === callId) {
          switch (action) {
            case 'mute-agent':
            case 'mute-customer':
              return { ...call, status: call.status === 'muted' ? 'active' : 'muted' }
            case 'end-call':
              return { ...call, status: 'ended' }
            default:
              return call
          }
        }
        return call
      })
    )
  }

  // Handle selecting a call
  const handleCallSelect = (call: Call) => {
    setSelectedCall(selectedCall && selectedCall.id === call.id ? null : call)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Call Monitor</h1>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex flex-col md:flex-row gap-8">
        <CallList 
          calls={filteredCalls} 
          selectedCallId={selectedCall?.id}
          onCallSelect={handleCallSelect}
        />
        {selectedCall && (
          <CallDetail 
            call={selectedCall} 
            onCallAction={handleCallAction}
          />
        )}
      </div>
    </div>
  )
}
