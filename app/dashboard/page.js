// pages/dashboard.js
import React from 'react';

const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, margin: '10px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2>Section 1</h2>
          <p>Content for section 1...</p>
        </div>
        <div style={{ flex: 1, margin: '10px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2>Section 2</h2>
          <p>Content for section 2...</p>
        </div>
      </div>
      <div style={{ margin: '10px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>Section 3</h2>
        <p>Content for section 3...</p>
      </div>
    </div>
  );
};

export default Dashboard;
