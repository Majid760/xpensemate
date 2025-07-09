import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    // If already authenticated, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the auth component
  return children;
};

export default AuthRoute; 