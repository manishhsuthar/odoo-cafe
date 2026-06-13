import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const Coupons = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Coupons & Offers" />
        <main style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Coupon Generation</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Generate discount vouchers, seasonal promo codes, and customer loyalty rewards.</p>
        </main>
      </div>
    </div>
  );
};

export default Coupons;
