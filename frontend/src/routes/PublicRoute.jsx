import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
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
