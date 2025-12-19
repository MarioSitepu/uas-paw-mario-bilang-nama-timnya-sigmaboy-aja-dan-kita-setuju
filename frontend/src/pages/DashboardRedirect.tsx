import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const DashboardRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log('📊 DashboardRedirect - isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    console.log('⏳ DashboardRedirect still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton className="w-16 h-16 rounded-full" />
      </div>
    );
  }

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();
  console.log('👤 User object:', user);
  console.log('👤 User role (raw):', user?.role);
  console.log('👤 User role (normalized):', userRole);

  if (userRole === 'patient') {
    console.log('➡️ Redirecting to patient dashboard');
    return <Navigate to="/app/patient/dashboard" replace />;
  }

  if (userRole === 'doctor') {
    console.log('➡️ Redirecting to doctor dashboard');
    return <Navigate to="/app/doctor/dashboard" replace />;
  }

  console.log('⚠️ No valid role, redirecting to login');
  return <Navigate to="/auth/login" replace />;
};

