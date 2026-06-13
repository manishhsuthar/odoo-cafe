import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import loginBg from '../../assets/login_bg.png';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [loginGeneralError, setLoginGeneralError] = useState('');

  // SignUp inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState({});

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginGeneralError('');
    const errors = {};
    if (!loginEmail) errors.email = 'Email Address is required';
    if (!loginPassword) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }
    
    setLoginErrors({});
    const result = login(loginEmail, loginPassword);
    
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/pos');
      }
    } else {
      setLoginGeneralError(result.error);
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!signUpName) errors.name = 'Full Name is required';
    if (!signUpEmail) errors.email = 'Email Address is required';
    if (!signUpPassword) errors.password = 'Password is required';
    if (!agreeTerms) errors.terms = 'You must agree to the Terms & Conditions';
    
    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors);
      return;
    }
    
    setSignUpErrors({});
    alert('For security reasons, only the default cafe admin account can access the dashboard. Please sign in with cafe@admin.com / cafe123');
    setIsLogin(true);
  };

  const pageStyle = {
    minHeight: '100vh',
    backgroundImage: `url(${loginBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'var(--font-standard)',
    position: 'relative',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(43, 38, 33, 0.25)',
    zIndex: 1,
  };

  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: 'var(--card-shadow)',
    zIndex: 2,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  const titleStyle = {
    color: 'var(--text-primary)',
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px',
  };

  const subtitleStyle = {
    color: '#8a7e72',
    fontSize: '15px',
    fontWeight: '400',
    marginBottom: '36px',
  };

  const footerTextStyle = {
    color: '#a0958a',
    fontSize: '14px',
    marginTop: '32px',
  };

  const linkStyle = {
    color: 'var(--text-link)',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color var(--transition-speed)',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit',
  };

  return (
    <div style={pageStyle}>
      <div style={overlayStyle} />
      <div style={cardStyle}>
        {isLogin ? (
          /* LOGIN FORM */
          <div style={{ width: '100%' }}>
            <h1 style={titleStyle}>Welcome Back</h1>
            <p style={subtitleStyle}>Sign in to your restaurant account</p>

            <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
              {loginGeneralError && (
                <div style={{
                  backgroundColor: '#fdf2f2',
                  color: '#d9534f',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  textAlign: 'left',
                  border: '1px solid #f5c6cb',
                }}>
                  {loginGeneralError}
                </div>
              )}

              <Input
                label="EMAIL ADDRESS"
                type="email"
                placeholder="you@restaurant.com"
                leftIcon={Mail}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                error={loginErrors.email}
              />

              <Input
                label="PASSWORD"
                type="password"
                placeholder="••••••••"
                leftIcon={Lock}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                error={loginErrors.password}
              />

              {/* Remember Me & Forgot Password Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: '28px',
                fontSize: '14px',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#8a7e72',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      accentColor: 'var(--bg-button)',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                  Remember me
                </label>
                <a 
                  href="#forgot" 
                  style={{
                    color: 'var(--text-link)',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Forgot password? Log in with: cafe@admin.com / cafe123');
                  }}
                >
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" fullWidth>
                SIGN IN
              </Button>
            </form>

            <p style={footerTextStyle}>
              Don't have an account?{' '}
              <button 
                style={linkStyle} 
                onClick={() => {
                  setIsLogin(false);
                  setSignUpErrors({});
                }}
              >
                Create account
              </button>
            </p>
          </div>
        ) : (
          /* SIGN UP FORM */
          <div style={{ width: '100%' }}>
            <h1 style={titleStyle}>Create Account</h1>
            <p style={subtitleStyle}>Sign up for your restaurant account</p>

            <form onSubmit={handleSignUpSubmit} style={{ width: '100%' }}>
              <Input
                label="FULL NAME"
                type="text"
                placeholder="Your name"
                leftIcon={User}
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                error={signUpErrors.name}
              />

              <Input
                label="EMAIL ADDRESS"
                type="email"
                placeholder="you@restaurant.com"
                leftIcon={Mail}
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                error={signUpErrors.email}
              />

              <Input
                label="PASSWORD"
                type="password"
                placeholder="••••••••"
                leftIcon={Lock}
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                error={signUpErrors.password}
              />

              {/* Terms & Conditions Checkbox */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: '28px',
                fontSize: '14px',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#8a7e72',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{
                      accentColor: 'var(--bg-button)',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                  I agree to the Terms & Conditions
                </label>
                {signUpErrors.terms && (
                  <span style={{ color: '#d9534f', fontSize: '13px', marginTop: '6px' }}>
                    {signUpErrors.terms}
                  </span>
                )}
              </div>

              <Button type="submit" variant="primary" fullWidth>
                SIGN UP
              </Button>
            </form>

            <p style={footerTextStyle}>
              Already have an account?{' '}
              <button 
                style={linkStyle} 
                onClick={() => {
                  setIsLogin(true);
                  setLoginErrors({});
                }}
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
