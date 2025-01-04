// pages/live-call/[id].tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { CallInfo } from '../../components/CallInfo';
import { LiveCallMonitorPage } from '../../components/LiveCallMonitorUI'; // Updated import
import { VapiResponse } from '../../types/vapiTypes';

const LiveCallPage: React.FC = () => {
  const router = useRouter();
  const [callData, setCallData] = useState<VapiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch call data based on the `callId` passed in the URL
  const fetchCallData = useCallback(async (callId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/calls/${callId}`);
      const data = await response.json();
      setCallData(data);
    } catch (error) {
      console.error('Error fetching call data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.id) {
      fetchCallData(router.query.id as string);
    }
  }, [router.isReady, router.query.id, fetchCallData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!callData) {
    return <div>Error: Unable to load call data</div>;
  }

  // Now that `userId` exists in `callData`, pass it to LiveCallMonitorPage
  const userId = callData.userId || 'defaultUserId'; // Use a fallback value if userId is missing

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Call</h1>
      <CallInfo callData={callData} />
      <LiveCallMonitorPage userId={userId} /> {/* Pass userId to LiveCallMonitorPage */}
    </div>
  );
};

export default LiveCallPage;
