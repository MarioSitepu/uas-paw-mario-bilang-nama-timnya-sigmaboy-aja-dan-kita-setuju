import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔐 RequireAuth check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    console.log('⏳ Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton className="w-16 h-16 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  console.log('✅ Authenticated, rendering children');
  return <>{children}</>;
};

