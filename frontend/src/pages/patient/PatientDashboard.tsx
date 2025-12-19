import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
import type { Appointment } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const all = await appointmentsService.getAll({ patientId: user.id });
      const upcoming = all
        .filter((apt) => ['pending', 'confirmed'].includes(apt.status))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/app/patient/appointments',
    },
    {
      label: 'Find Doctors',
      value: 'Browse',
      icon: Stethoscope,
      color: 'bg-green-500',
      link: '/app/patient/doctors',
    },
    {
      label: 'Book New',
      value: 'Appointment',
      icon: Plus,
      color: 'bg-purple-500',
      link: '/app/patient/appointments/new',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-slate-600">Here's your health overview</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="bento-card group hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  <IconComponent size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Upcoming Appointments</h2>
          <Link
            to="/app/patient/appointments"
            className="text-pastel-blue-600 hover:underline font-medium"
          >
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-48" />
            ))}
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} className="text-slate-400" />}
            title="No upcoming appointments"
            description="Book your first appointment to get started"
            action={
              <Link
                to="/app/patient/appointments/new"
                className="px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Book Appointment
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

