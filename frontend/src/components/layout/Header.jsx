import React from 'react';

const Header = ({ title }) => {
  return (
    <header style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <h2 className="handwritten" style={{ fontSize: '28px' }}>{title}</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#ff4b5c',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
        }}>J</div>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#ff8a5c',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
        }}>A</div>
      </div>
    </header>
  );
};

export default Header;
