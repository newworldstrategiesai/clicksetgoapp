'use client';

import React from 'react';
import CallChart from 'components/ui/Charts/CallChart';
import SMSChart from 'components/ui/Charts/SmsChart';

const OverviewPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Overview</h1>
      <div className="mb-8">
        <CallChart />
      </div>
      <div>
        <SMSChart />
      </div>
    </div>
  );
};

export default OverviewPage;
