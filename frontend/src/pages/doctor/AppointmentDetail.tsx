import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
import { recordsService } from '../../services/mock/records.service';
import type { Appointment, AppointmentStatus, MedicalRecord } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { useToastContext } from '../../components/ui/Toast';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const DoctorAppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    notes: '',
    symptoms: '',
    treatment: '',
    prescription: '',
  });
  const { addToast } = useToastContext();

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const apt = await appointmentsService.getById(parseInt(id));
      if (apt && apt.doctorId === user?.id) {
        setAppointment(apt);
        // Load medical record if exists
        try {
          const record = await recordsService.getByAppointment(apt.id);
          setMedicalRecord(record);
        } catch {
          // No record yet
        }
      } else {
        addToast('Appointment not found', 'error');
        navigate('/app/doctor/schedule');
      }
    } catch (error) {
      console.error('Failed to load appointment:', error);
      addToast('Failed to load appointment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: AppointmentStatus) => {
    if (!appointment) return;
    setIsSubmitting(true);
    try {
      await appointmentsService.updateStatus(appointment.id, newStatus);
      addToast('Status updated successfully', 'success');
      loadAppointment();
    } catch (error: any) {
      addToast(error.message || 'Failed to update status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!appointment) return;
    if (!recordForm.diagnosis || !recordForm.notes) {
      addToast('Please fill in diagnosis and notes', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const record = await recordsService.create({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        diagnosis: recordForm.diagnosis,
        notes: recordForm.notes,
        symptoms: recordForm.symptoms || undefined,
        treatment: recordForm.treatment || undefined,
        prescription: recordForm.prescription || undefined,
      });
      setMedicalRecord(record);
      setShowRecordModal(false);
      addToast('Medical record created successfully', 'success');
      setRecordForm({ diagnosis: '', notes: '', symptoms: '', treatment: '', prescription: '' });
    } catch (error: any) {
      addToast(error.message || 'Failed to create medical record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const canUpdateStatus = ['pending', 'confirmed'].includes(appointment.status);
  const canCreateRecord = appointment.status === 'completed' && !medicalRecord;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Appointment Details</h1>
          <p className="text-slate-600">View and manage appointment</p>
        </div>
        <button
          onClick={() => navigate('/app/doctor/schedule')}
          className="px-4 py-2 text-slate-600 hover:text-slate-800"
        >
          ← Back
        </button>
      </div>

      <div className="bento-card space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Status</h2>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Patient Info */}
        <div className="pb-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Patient Information</h3>
          <p className="text-slate-700">{appointment.patient?.name || 'Patient'}</p>
          <p className="text-sm text-slate-600">{appointment.patient?.email || ''}</p>
        </div>

        {/* Appointment Details */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Date</label>
            <p className="text-lg text-slate-800">
              {new Date(appointment.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Time</label>
            <p className="text-lg text-slate-800">{appointment.time}</p>
          </div>
          {appointment.reason && (
            <div>
              <label className="text-sm font-medium text-slate-600">Reason</label>
              <p className="text-lg text-slate-800">{appointment.reason}</p>
            </div>
          )}
        </div>

        {/* Status Actions */}
        {canUpdateStatus && (
          <div className="flex gap-4 pt-4 border-t border-slate-200">
            {appointment.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Confirm Appointment'}
              </button>
            )}
            {appointment.status === 'confirmed' && (
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}
          </div>
        )}

        {/* Medical Record */}
        {appointment.status === 'completed' && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Medical Record</h3>
              {canCreateRecord && (
                <button
                  onClick={() => setShowRecordModal(true)}
                  className="px-4 py-2 bg-pastel-blue-500 text-white rounded-lg font-medium hover:bg-pastel-blue-600 transition-colors"
                >
                  Create Record
                </button>
              )}
            </div>
            {medicalRecord ? (
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-slate-600">Diagnosis</label>
                  <p className="text-slate-800">{medicalRecord.diagnosis}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <p className="text-slate-800">{medicalRecord.notes}</p>
                </div>
                {medicalRecord.symptoms && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Symptoms</label>
                    <p className="text-slate-800">{medicalRecord.symptoms}</p>
                  </div>
                )}
                {medicalRecord.treatment && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Treatment</label>
                    <p className="text-slate-800">{medicalRecord.treatment}</p>
                  </div>
                )}
                {medicalRecord.prescription && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Prescription</label>
                    <p className="text-slate-800">{medicalRecord.prescription}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No medical record created yet</p>
            )}
          </div>
        )}
      </div>

      {/* Create Record Modal */}
      <Modal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        title="Create Medical Record"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500"
              placeholder="Enter diagnosis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500"
              placeholder="Enter notes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms</label>
            <textarea
              rows={2}
              value={recordForm.symptoms}
              onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500"
              placeholder="Enter symptoms"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Treatment</label>
            <textarea
              rows={2}
              value={recordForm.treatment}
              onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500"
              placeholder="Enter treatment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prescription</label>
            <textarea
              rows={2}
              value={recordForm.prescription}
              onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500"
              placeholder="Enter prescription"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowRecordModal(false)}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRecord}
              disabled={isSubmitting || !recordForm.diagnosis || !recordForm.notes}
              className="flex-1 px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

