import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return user?.role === 'admin' 
      ? <Navigate to="/dashboard" replace /> 
      : <Navigate to="/pos" replace />;
  }

  return children;
};

export default PublicRoute;
