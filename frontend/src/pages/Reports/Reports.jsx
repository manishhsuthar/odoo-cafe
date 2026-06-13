import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const Reports = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Reports" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Business Reports</h2>
          <p style={{ marginTop: '12px' }}>Analyze sales velocity, peak hours, category performance, and employee shifts.</p>
        </main>
      </div>
    </div>
  );
};

export default Reports;
