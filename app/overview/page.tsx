'use client';

import React from 'react';
import CallChart from 'components/ui/Charts/CallChart';
import SMSChart from 'components/ui/Charts/SmsChart';
import Sidebar from 'components/ui/Sidebar/Sidebar';

const OverviewPage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 main-content">
        <h1 className="text-2xl font-bold mb-4">Overview</h1>
        <div className="chart-grid">
          <div className="chart-panel chart-large">
            <h2>Total Call Minutes</h2>
            <CallChart />
          </div>
          <div className="chart-panel">
            <h2>Reason Call Ended</h2>
            <SMSChart />
          </div>
          <div className="chart-panel">
            <h2>Average Call Duration by Assistant</h2>
            <SMSChart />
          </div>
          <div className="chart-panel">
            <h2>Cost Per Provider</h2>
            <SMSChart />
          </div>
          <div className="chart-panel">
            <h2>Assistants Table</h2>
            {/* Add your Assistants Table component here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
