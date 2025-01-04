// components/CallInfo.tsx

import React, { useState, useEffect } from 'react';
import { VapiResponse } from '../types/vapiTypes';

interface CallInfoProps {
  callData: VapiResponse;
}

export const CallInfo: React.FC<CallInfoProps> = ({ callData }) => {
  const [isRecordingAvailable, setIsRecordingAvailable] = useState(false);

  useEffect(() => {
    // Check if the recording URL exists and update the state
    if (callData?.artifact?.recordingUrl) {
      setIsRecordingAvailable(true);
    } else {
      setIsRecordingAvailable(false);
    }
  }, [callData]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Call Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Call ID:</p>
          <p>{callData.id}</p>
        </div>
        <div>
          <p className="font-semibold">Status:</p>
          <p>{callData.status}</p>
        </div>
        <div>
          <p className="font-semibold">Started At:</p>
          <p>{callData.startedAt || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Ended At:</p>
          <p>{callData.endedAt || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Total Cost:</p>
          <p>
            $
            {callData.costBreakdown?.total
              ? callData.costBreakdown.total.toFixed(2)
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Play audio if recordingUrl is available */}
      {isRecordingAvailable && callData.artifact?.recordingUrl && (
        <div className="mt-4">
          <p className="font-semibold">Call Recording:</p>
          <audio controls className="w-full mt-2">
            <source src={callData.artifact.recordingUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};
