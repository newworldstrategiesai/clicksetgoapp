import React from 'react';
import Link from 'next/link';
import { Call } from '@/types/Call';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

interface CallListProps {
  calls: Call[];
  selectedCallId: string | undefined;
  onCallSelect: (call: Call) => void;
}

export function CallList({ calls, selectedCallId, onCallSelect }: CallListProps) {
  return (
    <div className="w-full md:w-1/3">
      <h2 className="text-xl font-semibold mb-4">Active Calls</h2>
      <div className="space-y-2">
        {calls.map(call => (
          <div
            key={call.id}
            className={`p-4 border rounded-md transition-colors ${
              call.id === selectedCallId
                ? 'bg-blue-100 border-blue-500'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="cursor-pointer" onClick={() => onCallSelect(call)}>
                <div className="font-semibold">{call.agentName}</div>
                <div className="text-sm text-gray-600">{call.customerName}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/admin/call-transcript/${call.id}`} passHref>
                  <button className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                    <MessageSquare size={18} />
                  </button>
                </Link>
                <button onClick={() => onCallSelect(call)}>
                  {call.id === selectedCallId ? (
                    <ChevronUp className="text-blue-500" />
                  ) : (
                    <ChevronDown className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {call.id === selectedCallId && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-500">
                  Duration: {formatDuration(call.duration)}
                </div>
                <div className="text-sm font-medium">
                  Status: <span className={getStatusColor(call.status)}>{call.status}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Call ID: {call.id}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600';
    case 'on hold':
      return 'text-yellow-600';
    case 'muted':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

