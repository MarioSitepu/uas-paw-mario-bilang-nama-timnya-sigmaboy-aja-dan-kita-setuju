import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { MedicalRecord } from '../../types';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadRecords();
    }
  }, [user]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get('/api/medical-records');
      const all = response.data.medical_records || [];
      console.log('📋 Loaded medical records:', all);
      setRecords(all.sort((a: MedicalRecord, b: MedicalRecord) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Medical Records</h1>
        <p className="text-slate-600">View and manage patient medical records</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-64" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No medical records"
          description="Medical records will appear here after you complete appointments"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div key={record.id} className="bento-card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  {record.patient?.name || 'Patient'} Record #{record.id}
                </h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(record.created_at || new Date()).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Diagnosis</label>
                  <p className="text-sm text-slate-800 line-clamp-2">{record.diagnosis}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Notes</label>
                  <p className="text-sm text-slate-600 line-clamp-2">{record.notes}</p>
                </div>
                {record.symptoms && (
                  <div>
                    <label className="text-xs font-medium text-slate-600">Symptoms</label>
                    <p className="text-sm text-slate-600 line-clamp-1">{record.symptoms}</p>
                  </div>
                )}
                {record.treatment && (
                  <div>
                    <label className="text-xs font-medium text-slate-600">Treatment</label>
                    <p className="text-sm text-slate-600 line-clamp-1">{record.treatment}</p>
                  </div>
                )}
                {record.prescription && (
                  <div>
                    <label className="text-xs font-medium text-slate-600">Prescription</label>
                    <p className="text-sm text-slate-600 line-clamp-1">{record.prescription}</p>
                  </div>
                )}
              </div>
              <Link
                to={`/app/doctor/appointments/${record.appointment_id}`}
                className="block w-full text-center px-4 py-2 bg-pastel-blue-50 text-pastel-blue-700 rounded-lg font-medium hover:bg-pastel-blue-100 transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

