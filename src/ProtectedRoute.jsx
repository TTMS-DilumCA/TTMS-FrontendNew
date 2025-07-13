import React from 'react';
import { Navigate } from 'react-router-dom';
import RoleBasedLayout from './RoleBasedLayout';

const ProtectedRoute = ({ component: Component, role, ...rest }) => {
  const token = localStorage.getItem('token');
  const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;

  return token && userRole === role ? (
    <RoleBasedLayout role={userRole}>
      <Component {...rest} />
    </RoleBasedLayout>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;