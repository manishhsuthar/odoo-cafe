import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

const Categories = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Categories" />
        <main style={{ padding: '24px' }}>
          <h2 className="handwritten">Categories Management</h2>
          <p style={{ marginTop: '12px' }}>Define product families, custom display groups, and kitchen routing tags here.</p>
        </main>
      </div>
    </div>
  );
};

export default Categories;
