import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment'; // Import moment
import { VapiResponse } from '@/types/vapiTypes';
import { useSearchParams } from 'next/navigation';
import LiveCallModal from './LiveCallModal'; // Import LiveCallModal

interface LiveCallMonitorProps {
  userId: string;  // Expect userId as prop instead of callData
}

export const LiveCallMonitor: React.FC<LiveCallMonitorProps> = ({ userId }) => {
  const [calls, setCalls] = useState<VapiResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [intervention, setIntervention] = useState('');
  const [selectedCall, setSelectedCall] = useState<VapiResponse | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch calls from API
  const fetchCalls = async () => {
    try {
      const response = await axios.get('/api/api-call-logs_pagination', {
        params: { page },
        headers: { Authorization: `Bearer ${userId}` },
      });
      const { logs, hasMore: moreLogs } = response.data;

      setCalls(logs);
      setHasMore(moreLogs);
    } catch (error) {
      console.error('Error fetching call logs:', error);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [page]);

  // Handle listening to the live call audio
  useEffect(() => {
    if (isListening && audioRef.current && selectedCall) {
      audioRef.current.src = selectedCall.monitor.listenUrl;
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isListening, selectedCall]);

  // Set up WebSocket for live transcript updates
  useEffect(() => {
    if (isListening && selectedCall && !wsRef.current) {
      wsRef.current = new WebSocket(selectedCall.monitor.controlUrl);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript') {
          setSelectedCall((prev) => {
            if (prev && prev.artifact) {
              const updatedTranscript = prev.artifact.transcript
                ? [...prev.artifact.transcript, data.content]
                : [data.content];  // If transcript is not initialized, initialize it

              return {
                ...prev,
                artifact: {
                  ...prev.artifact,
                  transcript: updatedTranscript,
                },
              };
            }
            return prev;
          });
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        wsRef.current = null;
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isListening, selectedCall]);

  // Handle intervention input
  const handleIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (intervention.trim() && wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'intervention', content: intervention }));
      setIntervention('');
    }
  };

  const openCallDetails = (call: VapiResponse) => {
    setSelectedCall(call);
  };

  const goToPreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Call Monitor</h1>

      {/* Call List */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Caller</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => openCallDetails(call)}>
                <td className="px-4 py-2">{call.customer?.number || 'Unknown'}</td>
                <td className="px-4 py-2">{call.status}</td>
                <td className="px-4 py-2">
                  {call.startedAt && call.endedAt
                    ? moment.utc(moment(call.endedAt).diff(moment(call.startedAt))).format('HH:mm:ss')
                    : 'N/A'}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => openCallDetails(call)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Listen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPreviousPage}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={goToNextPage}
          disabled={!hasMore}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Live Call Details */}
      {selectedCall && (
        <div className="mt-8">
          <LiveCallModal listenUrl={selectedCall.monitor.listenUrl} onClose={() => setSelectedCall(null)} />
        </div>
      )}
    </div>
  );
};
