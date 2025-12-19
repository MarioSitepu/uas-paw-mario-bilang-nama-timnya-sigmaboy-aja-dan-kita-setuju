import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import type { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const AppointmentsList: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { appointmentsAPI } = await import('../../services/api');
      const filters: { status?: AppointmentStatus } = {};

      // Map 'all' to undefined (no filter) or specific statuses if backend supports 'all'
      // Backend supports filtering by specific status. If 'all', don't send status param.
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await appointmentsAPI.getAll(filters);

      const rawAppointments = response.data.appointments || [];
      const all: Appointment[] = rawAppointments.map((raw: any) => ({
        ...raw,
        id: raw.id,
        patientId: raw.patient_id,
        doctorId: raw.doctor_id,
        date: raw.appointment_date,
        time: raw.appointment_time,
        status: raw.status,
        reason: raw.reason,
        notes: raw.notes,
        doctor: raw.doctor ? {
          ...raw.doctor,
          id: raw.doctor.id,
          name: raw.doctor.name || 'Doctor',
          specialization: raw.doctor.specialization,
          photoUrl: raw.doctor.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.doctor.name || 'D')}&background=random`,
          clinic: raw.doctor.clinic || 'Clinic'
        } : undefined,
        patient: raw.patient ? {
          ...raw.patient,
          photoUrl: raw.patient.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.patient.name || 'P')}&background=random`
        } : undefined
      }));

      setAppointments(all.sort((a, b) => {
        if (a.date === b.date) return b.time.localeCompare(a.time);
        return b.date.localeCompare(a.date);
      }));
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, user?.id]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const handleAction = (action: string, appointmentId: number) => {
    if (action === 'reschedule') {
      // Navigate to reschedule page or open modal
      window.location.href = `/app/patient/appointments/${appointmentId}?action=reschedule`;
    } else if (action === 'cancel') {
      // Handle cancel
      window.location.href = `/app/patient/appointments/${appointmentId}?action=cancel`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Appointments</h1>
          <p className="text-slate-600">Manage your appointments</p>
        </div>
        <Link
          to="/app/patient/appointments/new"
          className="px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Book New
        </Link>
      </div>

      {/* Filter */}
      <div className="bento-card">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === status
                ? 'bg-pastel-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-64" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} className="text-slate-400" />}
          title="No appointments found"
          description={statusFilter === 'all' ? 'Book your first appointment to get started' : `No ${statusFilter} appointments`}
          action={
            statusFilter === 'all' ? (
              <Link
                to="/app/patient/appointments/new"
                className="px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Book Appointment
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              showActions={true}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

