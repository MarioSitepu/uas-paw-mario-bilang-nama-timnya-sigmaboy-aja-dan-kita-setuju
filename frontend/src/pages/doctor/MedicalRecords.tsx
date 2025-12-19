import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import type { MedicalRecord } from '../../types';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { medicalRecordsAPI } = await import('../../services/api');
      const response = await medicalRecordsAPI.getAll();
      const rawRecords = response.data.medical_records || [];

      const all: MedicalRecord[] = rawRecords.map((raw: any) => ({
        ...raw,
        id: raw.id,
        appointmentId: raw.appointment_id,
        patientId: raw.patient_id,
        doctorId: raw.doctor_id,
        diagnosis: raw.diagnosis,
        notes: raw.notes,
        symptoms: raw.symptoms,
        treatment: raw.treatment,
        prescription: raw.prescription,
        createdAt: raw.created_at || new Date().toISOString(),
        patient: raw.patient // Backend returns this
      }));

      setRecords(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

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
          icon={<ClipboardList size={48} className="text-slate-400" />}
          title="No medical records"
          description="Medical records will appear here after you complete appointments"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div key={record.id} className="bento-card group hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={record.patient?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.patient?.name || 'P')}&background=random`}
                    alt={record.patient?.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{record.patient?.name || 'Unknown Patient'}</h3>
                    <p className="text-xs text-slate-500">{record.patient?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">#{record.id}</span>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    {new Date(record.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Diagnosis</label>
                  <p className="text-sm font-medium text-slate-800">{record.diagnosis}</p>
                </div>

                {record.notes && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">Notes</label>
                    <p className="text-sm text-slate-600 line-clamp-2 italic">{record.notes}</p>
                  </div>
                )}
              </div>

              <Link
                to={`/app/doctor/appointments/${record.appointmentId}`}
                className="block w-full text-center px-4 py-2 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-md transition-all transform group-hover:scale-[1.02]"
              >
                View Full Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

