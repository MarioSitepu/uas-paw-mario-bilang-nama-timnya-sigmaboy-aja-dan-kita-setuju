import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
import type { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const AppointmentsList: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user, statusFilter]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const filters: any = { patientId: user!.id };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const all = await appointmentsService.getAll(filters);
      setAppointments(all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
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
              showActions={true}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

