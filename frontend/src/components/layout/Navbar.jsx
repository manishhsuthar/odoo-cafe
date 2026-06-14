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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Odoo Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </Link>
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
