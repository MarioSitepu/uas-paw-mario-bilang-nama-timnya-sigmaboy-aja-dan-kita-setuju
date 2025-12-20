import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
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
      const response = await authAPI.get(`/api/appointments/${id}`);
      const apt = response.data.appointment;

      console.log('🔍 Doctor AppointmentDetail - Raw appointment:', apt);
      console.log('🔍 Current user:', user);

      // Transform backend format to frontend format
      const appointment: Appointment = {
        id: apt.id,
        doctorId: apt.doctor_id,
        patientId: apt.patient_id,
        date: apt.appointment_date,
        time: apt.appointment_time,
        status: apt.status,
        reason: apt.reason,
        createdAt: apt.created_at || new Date().toISOString(),
        doctor: apt.doctor,
        patient: apt.patient,
      };

      console.log('🔍 Transformed appointment:', appointment);
      console.log('🔍 Checking: appointment.doctorId=' + appointment.doctorId + ', user?.id=' + user?.id);

      // Get current user's doctor profile to verify access
      let doctorId: number | null = null;
      if (!user) {
        addToast('User not authenticated', 'error');
        navigate('/auth/login');
        return;
      }

      const userRole = user.role?.toLowerCase();
      if (userRole === 'doctor') {
        // Try to get doctor profile from user object
        if (user.doctor_profile?.id) {
          doctorId = user.doctor_profile.id;
        } else {
          // If not in user object, fetch it from API
          try {
            const meResponse = await authAPI.getMe();
            const meUser = meResponse.data.user || meResponse.data;
            if (meUser?.doctor_profile?.id) {
              doctorId = meUser.doctor_profile.id;
            } else {
              // Try to get doctor by user_id
              const { doctorsAPI } = await import('../../services/api');
              const doctorsResponse = await doctorsAPI.getAll();
              const doctors = doctorsResponse.data.doctors || [];
              const doctor = doctors.find((d: any) => d.user_id === user.id);
              if (doctor) {
                doctorId = doctor.id;
              }
            }
          } catch (err) {
            console.error('Failed to get doctor profile:', err);
          }
        }
      }

      if (appointment && doctorId && appointment.doctorId === doctorId) {
        console.log('✅ Access check passed - doctor owns this appointment');
        setAppointment(appointment);
        // Load medical record if exists
        try {
          const recordResponse = await authAPI.get(`/api/appointments/${id}/record`);
          console.log('📋 Medical record response:', recordResponse.data);
          if (recordResponse.data.medical_record) {
            setMedicalRecord(recordResponse.data.medical_record);
          }
        } catch (error) {
          // No record yet
          console.log('No medical record found for this appointment');
        }
      } else {
        console.error('❌ Access check failed:', {
          appointmentDoctorId: appointment.doctorId,
          currentUserDoctorId: doctorId,
          currentUserId: user?.id,
          currentUserRole: user?.role
        });
        addToast('Appointment not found or access denied', 'error');
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
      console.log(`📋 Updating appointment ${appointment.id} status to ${newStatus}`);
      await authAPI.put(`/api/appointments/${appointment.id}`, {
        status: newStatus,
      });
      addToast(`Status updated to ${newStatus}`, 'success');
      loadAppointment();
    } catch (error: any) {
      console.error('Status update error:', error);
      addToast(error.response?.data?.error || 'Failed to update status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    await handleStatusUpdate('confirmed');
    setShowConfirmModal(false);
  };

  const handleComplete = async () => {
    if (!appointment) return;
    // First update status to completed
    setIsSubmitting(true);
    try {
      await handleStatusUpdate('completed');
      setShowCompleteModal(false);
      // Reload appointment to get updated status
      await loadAppointment();
      // Then show the medical record form immediately
      setShowRecordModal(true);
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    await handleStatusUpdate('cancelled');
    setShowCancelModal(false);
  };

  const handleCreateRecord = async () => {
    if (!appointment) return;
    if (!recordForm.diagnosis || !recordForm.notes) {
      addToast('Please fill in diagnosis and notes', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('📝 Creating medical record for appointment:', appointment.id);
      const payload = {
        appointment_id: appointment.id,
        diagnosis: recordForm.diagnosis,
        notes: recordForm.notes,
        symptoms: recordForm.symptoms || undefined,
        treatment: recordForm.treatment || undefined,
        prescription: recordForm.prescription || undefined,
      };
      console.log('📤 Sending payload:', payload);

      const response = await authAPI.post('/api/medical-records', payload);
      console.log('✅ Medical record created:', response.data);

      if (response.data.medical_record) {
        setMedicalRecord(response.data.medical_record);
        console.log('📋 Medical record set:', response.data.medical_record);
      }

      setShowRecordModal(false);
      addToast('Medical record created successfully', 'success');
      setRecordForm({ diagnosis: '', notes: '', symptoms: '', treatment: '', prescription: '' });

      // Reload appointment to get updated status (should be completed now)
      await loadAppointment();

      // Wait a moment then redirect to dashboard
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/app/doctor/dashboard');
    } catch (error: any) {
      console.error('❌ Failed to create medical record:', error);
      console.error('❌ Error details:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create medical record';
      addToast(errorMsg, 'error');
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
  // Doctor can create record if appointment is confirmed or completed, and no record exists yet
  const canCreateRecord = (appointment.status === 'confirmed' || appointment.status === 'completed') && !medicalRecord;

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
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Patient Information</h3>
              <p className="text-slate-700">{appointment.patient?.name || 'Patient'}</p>
              <p className="text-sm text-slate-600">{appointment.patient?.email || ''}</p>
            </div>
            <Link
              to={`/app/chat?partnerId=${appointment.patientId}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </Link>
          </div>
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
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Confirm Appointment'}
              </button>
            )}
            {appointment.status === 'confirmed' && (
              <button
                onClick={() => setShowCompleteModal(true)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Cancel Appointment'}
            </button>
          </div>
        )}

        {/* Medical Record */}
        {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
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

      {/* Confirm Appointment Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Appointment"
      >
        <p className="mb-6 text-slate-600">
          Are you sure you want to confirm this appointment?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </Modal>

      {/* Complete Appointment Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Mark as Completed"
      >
        <p className="mb-6 text-slate-600">
          Are you sure you want to mark this appointment as completed? You will be asked to enter medical records.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCompleteModal(false)}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Marking...' : 'Mark as Completed'}
          </button>
        </div>
      </Modal>

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
      >
        <p className="mb-6 text-slate-600">
          Are you sure you want to cancel this appointment?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCancelModal(false)}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            No, Keep It
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

