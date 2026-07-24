import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children, adminOnly = false, posOnly = false }) => {
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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isKitchen = user?.role === 'chef' || user?.role === 'kitchen';

  if (adminOnly && user?.role !== 'admin') {
    const redirectPath = isKitchen ? '/kds' : '/pos';
    return <Navigate to={redirectPath} replace />;
  }

  if (posOnly && isKitchen) {
    return <Navigate to="/kds" replace />;
  }

  return children;
};

export default PrivateRoute;
