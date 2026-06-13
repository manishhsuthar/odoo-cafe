import React from 'react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

const Header = ({ title }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      padding: '24px 40px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'var(--bg-card)',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        margin: 0,
        fontFamily: 'var(--font-standard)',
      }}>
        {title}
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-button)',
            transition: 'background-color 0.2s',
          }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              color: 'var(--text-secondary)',
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
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: '700',
              fontFamily: 'var(--font-standard)',
              border: '2px solid var(--border-color)',
            }}>
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
