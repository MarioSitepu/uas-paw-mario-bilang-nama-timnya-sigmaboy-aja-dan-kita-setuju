import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const DashboardRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton className="w-16 h-16 rounded-full" />
      </div>
    );
  }

  if (user?.role === 'PATIENT') {
    return <Navigate to="/app/patient/dashboard" replace />;
  }

  if (user?.role === 'DOCTOR') {
    return <Navigate to="/app/doctor/dashboard" replace />;
  }

  return <Navigate to="/auth/login" replace />;
};

