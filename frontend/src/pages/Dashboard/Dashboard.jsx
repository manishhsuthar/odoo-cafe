import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Dashboard" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Welcome to the Dashboard!</h2>
          <p style={{ marginTop: '12px' }}>Here you will see your store statistics, key performance metrics, and activity summary.</p>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
