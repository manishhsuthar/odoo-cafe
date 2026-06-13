import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside style={{
      width: '240px',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
    }}>
      <Link to="/dashboard" className="handwritten">Dashboard</Link>
      <Link to="/products" className="handwritten">Products</Link>
      <Link to="/categories" className="handwritten">Categories</Link>
      <Link to="/employees" className="handwritten">Employees</Link>
      <Link to="/orders" className="handwritten">Orders</Link>
      <Link to="/customers" className="handwritten">Customers</Link>
      <Link to="/reports" className="handwritten">Reports</Link>
    </aside>
  );
};

export default Sidebar;
