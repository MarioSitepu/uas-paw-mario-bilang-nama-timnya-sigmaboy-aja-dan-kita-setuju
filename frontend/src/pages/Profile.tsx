import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const handlePhotoUploadSuccess = (photoUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profile_photo_url: photoUrl };
      updateUser(updatedUser);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Profil</h1>
        <p className="text-slate-600">Informasi akun Anda</p>
      </div>

      <div className="bento-card space-y-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-200">
          <ProfilePhotoUpload
            currentPhoto={user?.profile_photo_url || undefined}
            onSuccess={handlePhotoUploadSuccess}
            size="large"
            className="mb-2"
          />
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-800">{user?.name}</h2>
            <p className="text-slate-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Nama</label>
            <p className="text-lg text-slate-800">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <p className="text-lg text-slate-800">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Peran</label>
            <p className="text-lg text-slate-800 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

