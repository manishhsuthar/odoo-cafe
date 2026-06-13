import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  error,
  leftIcon: LeftIcon,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    marginBottom: '18px',
  };

  const labelStyle = {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'left',
    letterSpacing: '0.5px',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)',
    border: '1.5px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all var(--transition-speed)',
    paddingLeft: LeftIcon ? '44px' : '16px',
    paddingRight: isPassword ? '44px' : '16px',
    fontFamily: 'var(--font-standard)',
  };

  const leftIconStyle = {
    position: 'absolute',
    left: '16px',
    color: '#a0958a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  const eyeButtonStyle = {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#a0958a',
    padding: 0,
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--border-focus)';
    e.target.style.boxShadow = '0 0 0 4px rgba(191, 174, 158, 0.15)';
    e.target.style.backgroundColor = '#ffffff';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--border-color)';
    e.target.style.boxShadow = 'none';
    e.target.style.backgroundColor = 'var(--input-bg)';
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {LeftIcon && (
          <div style={leftIconStyle}>
            <LeftIcon size={18} />
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          required={required}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            style={eyeButtonStyle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span style={{ color: '#d9534f', fontSize: '13px', marginTop: '2px', textAlign: 'left' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
