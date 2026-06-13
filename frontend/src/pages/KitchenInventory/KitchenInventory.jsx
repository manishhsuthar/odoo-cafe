import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const KitchenInventory = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Kitchen Inventory" />
        <main style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Kitchen Inventory Management</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Track stock levels, ingredients, raw food items, and supplier logs here.</p>
        </main>
      </div>
    </div>
  );
};

export default KitchenInventory;
