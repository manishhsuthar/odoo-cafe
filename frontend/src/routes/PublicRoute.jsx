import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        Loading session...
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user?.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.role === 'chef' || user?.role === 'kitchen') {
      return <Navigate to="/kds" replace />;
    } else {
      return <Navigate to="/pos" replace />;
    }
  }

  return children;
};

export default PublicRoute;
