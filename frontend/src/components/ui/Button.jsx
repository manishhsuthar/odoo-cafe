import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary'
  fullWidth = false,
  className = '',
  disabled = false,
  style = {},
  ...props
}) => {
  const baseStyle = {
    fontFamily: 'var(--font-standard)',
    fontWeight: '700',
    fontSize: '14px',
    letterSpacing: '0.5px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    padding: '14px 24px',
    borderRadius: '12px',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    transition: 'all var(--transition-speed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const variantStyle = variant === 'primary' 
    ? {
        backgroundColor: 'var(--bg-primary-button)',
        color: 'var(--text-primary-button)',
      }
    : {
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
        border: '1.5px solid var(--border-color)',
      };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.target.style.backgroundColor = 'var(--bg-primary-button-hover)';
    } else {
      e.target.style.borderColor = 'var(--border-focus)';
      e.target.style.backgroundColor = 'var(--input-bg)';
    }
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.target.style.backgroundColor = 'var(--bg-primary-button)';
    } else {
      e.target.style.borderColor = 'var(--border-color)';
      e.target.style.backgroundColor = 'transparent';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...baseStyle, ...variantStyle, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
