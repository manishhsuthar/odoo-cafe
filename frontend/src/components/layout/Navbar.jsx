import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)',
    }}>
      <div className="handwritten" style={{ fontSize: '24px', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: 'var(--text-primary)' }}>Odoo POS</Link>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/dashboard" className="handwritten" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
        <Link to="/pos" className="handwritten" style={{ color: 'var(--text-secondary)' }}>POS</Link>
        <Link to="/kds" className="handwritten" style={{ color: 'var(--text-secondary)' }}>KDS</Link>
        <Link to="/products" className="handwritten" style={{ color: 'var(--text-secondary)' }}>Products</Link>
      </div>
    </nav>
  );
};

export default Navbar;
