import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { MedicalRecord } from '../../types';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToastContext } from '../../components/ui/Toast';
import { Calendar, FileText } from 'lucide-react';

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Medical Records
        </h1>
        <p className="text-slate-600">View your medical records from completed appointments</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-80" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No medical records yet"
          description="Medical records will appear here after doctors complete your appointments"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bento-card hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {record.appointment?.doctor?.name || 'Doctor'}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(record.created_at)}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Diagnosis */}
                {record.diagnosis && (
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Diagnosis
                    </label>
                    <p className="text-sm text-slate-800 mt-1">{record.diagnosis}</p>
                  </div>
                )}

                {/* Symptoms */}
                {record.symptoms && (
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Symptoms
                    </label>
                    <p className="text-sm text-slate-700 mt-1">{record.symptoms}</p>
                  </div>
                )}

                {/* Treatment */}
                {record.treatment && (
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Treatment
                    </label>
                    <p className="text-sm text-slate-700 mt-1">{record.treatment}</p>
                  </div>
                )}

                {/* Prescription */}
                {record.prescription && (
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Prescription
                    </label>
                    <p className="text-sm text-slate-700 mt-1">{record.prescription}</p>
                  </div>
                )}

                {/* Notes */}
                {record.notes && (
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Notes
                    </label>
                    <p className="text-sm text-slate-700 mt-1">{record.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  Record ID: {record.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
