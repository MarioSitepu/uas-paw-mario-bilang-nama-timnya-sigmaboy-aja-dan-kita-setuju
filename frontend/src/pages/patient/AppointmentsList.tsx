import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const AppointmentsList: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user, statusFilter, location]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      console.log('=== LOADING APPOINTMENTS ===');
      console.log('📥 useEffect triggered, location:', location.pathname + location.search);
      console.log('📥 statusFilter:', statusFilter);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const apiUrl = `/api/appointments?${params.toString()}`;
      console.log('🔗 Calling API:', apiUrl);
      const response = await authAPI.get(apiUrl);
      let appointments = response.data.appointments || [];

      console.log('📋 Raw appointments from API - Total:', appointments.length);
      appointments.forEach((apt: any) => {
        console.log(`  - ID: ${apt.id}, Status: ${apt.status}, Patient: ${apt.patient?.name || 'N/A'}`);
      });

      // Transform backend format to frontend format
      appointments = appointments.map((apt: any) => ({
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
      }));

      console.log('✅ Transformed appointments - Total:', appointments.length);

      // ALWAYS filter out cancelled appointments UNLESS user specifically filters for cancelled
      if (statusFilter !== 'cancelled') {
        const beforeFilter = appointments.length;
        appointments = appointments.filter((apt: Appointment) => apt.status !== 'cancelled');
        const afterFilter = appointments.length;
        console.log(`🔍 Filtering cancelled: ${beforeFilter} → ${afterFilter} (removed ${beforeFilter - afterFilter})`);
      } else {
        console.log('🔍 Showing ONLY cancelled appointments');
      }

      const sorted = appointments.sort((a: Appointment, b: Appointment) => new Date(b.date).getTime() - new Date(a.date).getTime());
      console.log('📊 Final appointments to display:', sorted.length);
      sorted.forEach((apt: Appointment) => {
        console.log(`  - ID: ${apt.id}, Status: ${apt.status}, Date: ${apt.date}`);
      });
      console.log('=== LOAD COMPLETE ===');
      setAppointments(sorted);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: string, appointmentId: number) => {
    if (action === 'reschedule') {
      // Navigate to reschedule page or open modal
      window.location.href = `/app/patient/appointments/${appointmentId}?action=reschedule`;
    } else if (action === 'cancel') {
      // Handle cancel
      window.location.href = `/app/patient/appointments/${appointmentId}?action=cancel`;
    }
  };

  // Function to be called after successful appointment action (reschedule/cancel)
  /*
  const handleAppointmentUpdated = async () => {
    // Reload appointments after a successful action
    await loadAppointments();
  };
  */

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
          icon="📅"
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
              userRole="patient"
              showActions={true}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

