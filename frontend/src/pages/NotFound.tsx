import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pastel">
      <div className="text-center">
        <div className="text-9xl font-bold text-pastel-blue-300 mb-4">404</div>
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">Page Not Found</h1>
        <p className="text-slate-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

