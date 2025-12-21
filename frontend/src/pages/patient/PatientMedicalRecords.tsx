import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { MedicalRecord } from '../../types';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToastContext } from '../../components/ui/Toast';

export const PatientMedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToastContext();
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
      console.log('📋 Loaded medical records for patient:', all);
      console.log('📋 Total records:', all.length);
      
      // Transform backend format to frontend format
      // Backend already filters by current user role (patient sees only their own records)
      const transformed = all.map((rec: any) => ({
        id: rec.id,
        appointment_id: rec.appointment_id || rec.appointment?.id,
        diagnosis: rec.diagnosis,
        notes: rec.notes,
        symptoms: rec.symptoms,
        treatment: rec.treatment,
        prescription: rec.prescription,
        created_at: rec.created_at,
        patient: rec.appointment?.patient || rec.patient,
        appointment: rec.appointment,
      }));
      
      setRecords(transformed.sort((a: MedicalRecord, b: MedicalRecord) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ));
    } catch (error) {
      console.error('Failed to load records:', error);
      addToast('Failed to load medical records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Medical Records</h1>
        <p className="text-slate-600">View your medical records from completed appointments</p>
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
          description="Medical records will appear here after doctors complete your appointments"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div key={record.id} className="bento-card border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">
                  {record.appointment?.doctor?.name || 'Doctor'} Record #{record.id}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
