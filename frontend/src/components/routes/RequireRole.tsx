import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  try {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSkeleton className="w-16 h-16 rounded-full" />
        </div>
      );
    }

    if (!isAuthenticated) {
      console.warn('❌ User not authenticated, redirecting to login');
      return <Navigate to="/auth/login" replace />;
    }

    // Normalize user role to lowercase for comparison
    const userRole = user?.role?.toLowerCase();
    if (user && !allowedRoles.includes(userRole as UserRole)) {
      console.warn(`❌ Access denied - User role '${userRole}' not in allowed roles:`, allowedRoles);
      return <Navigate to="/app/unauthorized" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error('❌ RequireRole error:', error);
    return <Navigate to="/auth/login" replace />;
  }
};

