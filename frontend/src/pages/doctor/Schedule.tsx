import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
import type { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const all = await appointmentsService.getAll({ doctorId: user.id });
      setAppointments(all.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)));
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const handleStatusUpdate = async (appointmentId: number, newStatus: AppointmentStatus) => {
    try {
      const updated = await appointmentsService.updateStatus(appointmentId, newStatus);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: updated.status } : apt)),
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const toISODate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const toLocalDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`);

  const monthLabel = currentMonth.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const filteredAppointments =
    statusFilter === 'all'
      ? appointments
      : appointments.filter((apt) => apt.status === statusFilter);

  const selectedAppointments = filteredAppointments
    .filter((apt) => apt.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const appointmentsByDate = filteredAppointments.reduce((map, apt) => {
    const list = map.get(apt.date) ?? [];
    list.push(apt);
    map.set(apt.date, list);
    return map;
  }, new Map<string, Appointment[]>());

  for (const [key, list] of appointmentsByDate.entries()) {
    list.sort((a, b) => a.time.localeCompare(b.time));
    appointmentsByDate.set(key, list);
  }

  const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOfGrid = new Date(firstOfMonth);
  startOfGrid.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  const endOfGrid = new Date(lastOfMonth);
  endOfGrid.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

  const calendarDays: Date[] = [];
  const cursor = new Date(startOfGrid);
  while (cursor <= endOfGrid) {
    calendarDays.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const statusChipClasses: Record<AppointmentStatus, string> = {
    pending: 'bg-yellow-50/90 text-yellow-900 border border-yellow-200/70',
    confirmed: 'bg-blue-50/90 text-blue-900 border border-blue-200/70',
    completed: 'bg-green-50/90 text-green-900 border border-green-200/70',
    cancelled: 'bg-slate-100/90 text-slate-600 border border-slate-200/70',
  };

  const goToMonth = (direction: -1 | 1) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toISODate(today));
  };

  const handleDayClick = (day: Date) => {
    const iso = toISODate(day);
    setSelectedDate(iso);
    if (day.getMonth() !== currentMonth.getMonth() || day.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Schedule</h1>
        <p className="text-slate-600">Manage your appointments</p>
      </div>

      {/* Filters */}
      <div className="bento-card">
        <div className="sticky top-32 z-10 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToMonth(-1)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white transition-colors shadow-sm hover:shadow-md"
                  aria-label="Previous month"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => goToMonth(1)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white transition-colors shadow-sm hover:shadow-md"
                  aria-label="Next month"
                >
                  →
                </button>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-600">Month</p>
                <p className="text-lg font-semibold text-slate-900 tracking-tight truncate">{monthLabel}</p>
              </div>
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-2 rounded-xl bg-gradient-to-b from-pastel-blue-50 to-white text-pastel-blue-800 border border-pastel-blue-100/70 hover:from-pastel-blue-100 hover:to-white transition-colors shadow-sm hover:shadow-md"
              >
                Today
              </button>
            </div>

            <div className="sm:w-64">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                className="w-full px-4 py-2 border border-slate-300/80 rounded-xl focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 bg-white/90 shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="p-2 rounded-2xl bg-white/50 border border-white/40 shadow-sm">
            <div className="grid grid-cols-7 gap-2">
            {dayNames.map((name) => (
              <div
                key={name}
                className="bg-white/80 border border-slate-200/70 px-2 py-2 text-xs font-semibold text-slate-600 text-center rounded-xl"
              >
                {name}
              </div>
            ))}
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-white/40 border border-white/40 shadow-sm mt-3">
            <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const iso = toISODate(day);
              const inMonth =
                day.getMonth() === currentMonth.getMonth() && day.getFullYear() === currentMonth.getFullYear();
              const isSelected = iso === selectedDate;
              const isToday = iso === toISODate(new Date());
              const dayAppointments = appointmentsByDate.get(iso) ?? [];
              const maxVisible = 3;
              const visible = dayAppointments.slice(0, maxVisible);
              const hiddenCount = Math.max(0, dayAppointments.length - maxVisible);

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={[
                    'text-left p-3 min-h-28 relative transition-colors rounded-2xl border backdrop-blur-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pastel-blue-400',
                    inMonth
                      ? 'bg-white/75 border-slate-200/70 hover:bg-white'
                      : 'bg-slate-50/70 text-slate-400 border-slate-200/40 hover:bg-slate-100/70',
                    isSelected ? 'ring-2 ring-pastel-blue-500 shadow-md bg-white z-[1]' : 'ring-0',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={[
                        'inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-semibold tracking-tight',
                        isToday
                          ? 'bg-pastel-blue-50 text-pastel-blue-800 border border-pastel-blue-100/70'
                          : inMonth
                            ? 'text-slate-800'
                            : 'text-slate-400',
                      ].join(' ')}
                    >
                      {day.getDate()}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {dayAppointments.length > 0 ? dayAppointments.length : ''}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {visible.length === 0 && inMonth && isSelected ? (
                      <p className="text-xs text-slate-400">No schedule</p>
                    ) : (
                      visible.map((apt) => (
                        <Link
                          key={apt.id}
                          to={`/app/doctor/appointments/${apt.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={[
                            'block text-xs leading-4 px-2 py-1.5 rounded-xl truncate shadow-sm',
                            statusChipClasses[apt.status],
                          ].join(' ')}
                          title={`${apt.time} · ${apt.patient?.name ?? `Patient #${apt.patientId}`}`}
                        >
                          <span className="font-medium">{apt.time}</span>
                          <span className="mx-1">·</span>
                          <span className="truncate">{apt.patient?.name ?? `Patient #${apt.patientId}`}</span>
                        </Link>
                      ))
                    )}
                    {hiddenCount > 0 && (
                      <div className="inline-flex text-xs text-slate-600 font-medium px-2 py-1 rounded-xl bg-white/70 border border-slate-200/70">
                        +{hiddenCount} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-64" />
          ))}
        </div>
      ) : selectedAppointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments found"
          description={`No appointments for ${toLocalDate(selectedDate).toLocaleDateString('id-ID')}`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedAppointments.map((appointment) => (
            <div key={appointment.id} className="bento-card">
              <AppointmentCard appointment={appointment} showActions={false} />
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                {appointment.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Confirm
                  </button>
                )}
                {appointment.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Complete
                    </button>
                    <Link
                      to={`/app/doctor/appointments/${appointment.id}`}
                      className="flex-1 px-4 py-2 bg-pastel-blue-50 text-pastel-blue-700 rounded-lg font-medium hover:bg-pastel-blue-100 transition-colors text-center"
                    >
                      View
                    </Link>
                  </div>
                )}
                {appointment.status === 'completed' && (
                  <Link
                    to={`/app/doctor/appointments/${appointment.id}`}
                    className="w-full block px-4 py-2 bg-pastel-blue-500 text-white rounded-lg font-medium hover:bg-pastel-blue-600 transition-colors text-center"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
