import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    const redirectPath = (user?.role === 'chef' || user?.role === 'kitchen') ? '/kds' : '/pos';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;
