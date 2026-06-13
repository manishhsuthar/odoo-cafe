import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const Tables = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Tables Layout" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Floor Plan & Tables</h2>
          <p style={{ marginTop: '12px' }}>Configure dining sections, tables layout, seat limits, and table statuses.</p>
        </main>
      </div>
    </div>
  );
};

export default Tables;
