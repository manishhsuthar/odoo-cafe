import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const POS = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Point Of Sale" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Register / Checkout</h2>
          <p style={{ marginTop: '12px' }}>Interactive interface for order taking, payment processing, and bill printings.</p>
        </main>
      </div>
    </div>
  );
};

export default POS;
