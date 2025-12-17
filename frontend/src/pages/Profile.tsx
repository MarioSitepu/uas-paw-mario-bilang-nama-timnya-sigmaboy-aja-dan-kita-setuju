import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile</h1>
        <p className="text-slate-600">Your account information</p>
      </div>

      <div className="bento-card space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
          <img
            src={user?.photoUrl || `https://i.pravatar.cc/150?img=${user?.id || 1}`}
            alt={user?.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">{user?.name}</h2>
            <p className="text-slate-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-pastel-blue-100 text-pastel-blue-700 rounded-full text-sm font-medium capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Name</label>
            <p className="text-lg text-slate-800">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <p className="text-lg text-slate-800">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Role</label>
            <p className="text-lg text-slate-800 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

