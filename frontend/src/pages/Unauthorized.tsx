import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pastel">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-8">
          You don't have permission to access this page.
          {user && (
            <span className="block mt-2 text-sm">
              Your role: <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
            </span>
          )}
        </p>
        <Link
          to="/app"
          className="inline-block px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

