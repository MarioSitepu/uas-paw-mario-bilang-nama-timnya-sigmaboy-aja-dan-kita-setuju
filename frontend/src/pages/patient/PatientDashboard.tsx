import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { Appointment } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get('/api/appointments');
      let all = response.data.appointments || [];
      
      // Transform backend format to frontend format
      all = all.map((apt: any) => ({
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
      
      const upcoming = all
        .filter((apt: Appointment) => ['pending', 'confirmed'].includes(apt.status))
        .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: '📅',
      color: 'bg-blue-500',
      link: '/app/patient/appointments',
    },
    {
      label: 'Find Doctors',
      value: 'Browse',
      icon: '👨‍⚕️',
      color: 'bg-green-500',
      link: '/app/patient/doctors',
    },
    {
      label: 'Book New',
      value: 'Appointment',
      icon: '➕',
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
        {stats.map((stat, idx) => (
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
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
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
            icon="📅"
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
                userRole="patient"
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

