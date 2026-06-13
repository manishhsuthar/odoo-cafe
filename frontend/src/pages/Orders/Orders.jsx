import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const Orders = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Orders History" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Orders List</h2>
          <p style={{ marginTop: '12px' }}>Review receipts, transaction logs, refunds, and bill splits.</p>
        </main>
      </div>
    </div>
  );
};

export default Orders;
