import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const Customers = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Customers" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Customer Loyalty & Directory</h2>
          <p style={{ marginTop: '12px' }}>Track customer profiles, purchase history, reward points, and preferences.</p>
        </main>
      </div>
    </div>
  );
};

export default Customers;
