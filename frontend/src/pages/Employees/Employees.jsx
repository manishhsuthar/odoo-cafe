import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const Employees = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Employees" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Employees / Staff</h2>
          <p style={{ marginTop: '12px' }}>Manage server pin logins, roles, shifts, and system permissions.</p>
        </main>
      </div>
    </div>
  );
};

export default Employees;
