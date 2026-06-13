import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const PaymentMethods = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Payment Methods" />
        <main style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Payment Methods Configuration</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Enable/disable payment processors like UPI, Stripe, Cards, and Cash terminal integrations.</p>
        </main>
      </div>
    </div>
  );
};

export default PaymentMethods;
