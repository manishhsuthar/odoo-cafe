import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const KDS = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Kitchen Display System" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Kitchen Orders Queue</h2>
          <p style={{ marginTop: '12px' }}>Real-time dashboard for kitchen staff to prepare, bump, and complete menu orders.</p>
        </main>
      </div>
    </div>
  );
};

export default KDS;
