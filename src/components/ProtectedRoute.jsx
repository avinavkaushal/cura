import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If there is no logged-in user, redirect to the login page.
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If they are logged in, render the protected component (like the Dashboard).
  return children;
};

export default ProtectedRoute;