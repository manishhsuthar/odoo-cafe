import React from 'react';
import useAuth from '../../hooks/useAuth';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header style={{
      padding: '24px 40px',
      borderBottom: '1px solid #28211b',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#110f0d',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#ffffff',
        margin: 0,
        fontFamily: 'var(--font-standard)',
      }}>
        {title}
      </h2>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            color: '#a0958a',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {user.name}
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-button)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            fontWeight: '700',
            fontFamily: 'var(--font-standard)',
            border: '2px solid #28211b',
          }}>
            {user.name.charAt(0)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
