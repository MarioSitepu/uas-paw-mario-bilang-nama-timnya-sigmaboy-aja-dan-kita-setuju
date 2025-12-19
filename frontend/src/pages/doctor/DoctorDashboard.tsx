import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
import type { Appointment } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadTodayAppointments();
    }
  }, [user]);

  const loadTodayAppointments = async () => {
    try {
      setIsLoading(true);
      const all = await appointmentsService.getAll({ doctorId: user!.id });
      const today = new Date().toISOString().split('T')[0];
      const todayApts = all
        .filter((apt) => apt.date === today && ['pending', 'confirmed'].includes(apt.status))
        .sort((a, b) => a.time.localeCompare(b.time));
      setTodayAppointments(todayApts);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length,
      icon: '📅',
      color: 'bg-blue-500',
    },
    {
      label: 'View Schedule',
      value: 'Schedule',
      icon: '📋',
      color: 'bg-green-500',
      link: '/app/doctor/schedule',
    },
    {
      label: 'Medical Records',
      value: 'Records',
      icon: '📝',
      color: 'bg-purple-500',
      link: '/app/doctor/records',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome, dr. {user?.name}!
        </h1>
        <p className="text-slate-600">Here's your schedule overview</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Link
            key={idx}
            to={stat.link || '#'}
            className="bento-card group hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Today's Appointments</h2>
          <Link
            to="/app/doctor/schedule"
            className="text-pastel-blue-600 hover:underline font-medium"
          >
            View Schedule
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-48" />
            ))}
          </div>
        ) : todayAppointments.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No appointments today"
            description="You have no scheduled appointments for today"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayAppointments.map((appointment) => (
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

