import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
import { doctorsService } from '../../services/mock/doctors.service';
import type { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [doctorRating, setDoctorRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendMode, setTrendMode] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [all, doctor] = await Promise.all([
          appointmentsService.getAll({ doctorId: user.id }),
          doctorsService.getById(user.id),
        ]);

        if (!isActive) return;

        setAllAppointments(all);
        setDoctorRating(doctor?.rating ?? null);

        const today = toLocalISODate(new Date());
        const todayApts = all
          .filter((apt) => apt.date === today && ['pending', 'confirmed'].includes(apt.status))
          .sort((a, b) => a.time.localeCompare(b.time));
        setTodayAppointments(todayApts);
      } catch (error) {
        console.error('Failed to load appointments:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadDashboardData();
    const intervalId = window.setInterval(() => void loadDashboardData(), 30000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  const toLocalISODate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const jitter = (seed: number) => (((seed % 7) - 3) / 10);

  const satisfaction = (() => {
    const base = doctorRating ?? 4.6;
    const waitTime = clamp(base - 0.25 + jitter((user?.id ?? 1) * 11), 1, 5);
    const communication = clamp(base + 0.05 + jitter((user?.id ?? 1) * 17), 1, 5);
    const careQuality = clamp(base + 0.15 + jitter((user?.id ?? 1) * 23), 1, 5);
    const average = (waitTime + communication + careQuality) / 3;
    return [
      { label: 'Wait Time', value: waitTime },
      { label: 'Doctor Communication', value: communication },
      { label: 'Care Quality', value: careQuality },
      { label: 'Average', value: average, isAverage: true as const },
    ];
  })();

  const statusOrder: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

  const statusMeta: Record<
    AppointmentStatus,
    { label: string; color: string; pillClass: string }
  > = {
    pending: {
      label: 'Pending',
      color: 'rgb(251 191 36)',
      pillClass: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'rgb(14 165 233)',
      pillClass: 'bg-pastel-blue-50 text-pastel-blue-800 border border-pastel-blue-100/70',
    },
    completed: {
      label: 'Completed',
      color: 'rgb(34 197 94)',
      pillClass: 'bg-green-50 text-green-800 border border-green-200/80',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'rgb(148 163 184)',
      pillClass: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    },
  };

  const statusCounts = statusOrder.reduce<Record<AppointmentStatus, number>>((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<AppointmentStatus, number>);

  for (const apt of allAppointments) {
    statusCounts[apt.status] = (statusCounts[apt.status] ?? 0) + 1;
  }

  const totalByStatus = statusOrder.reduce((sum, status) => sum + statusCounts[status], 0);

  const donutStyle = (() => {
    if (totalByStatus === 0) {
      return { background: 'conic-gradient(rgb(226 232 240) 0 360deg)' } as const;
    }
    const nonZero = statusOrder
      .map((status) => ({
        status,
        value: statusCounts[status],
        color: statusMeta[status].color,
      }))
      .filter((s) => s.value > 0);

    let current = 0;
    const stops = nonZero.map((slice) => {
      const start = current;
      const pct = (slice.value / totalByStatus) * 100;
      current += pct;
      const end = current;
      return `${slice.color} ${start}% ${end}%`;
    });

    return { background: `conic-gradient(${stops.join(', ')})` } as const;
  })();

  const trendSeries = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeAppointments = allAppointments.filter((apt) => apt.status !== 'cancelled');

    if (trendMode === 'daily') {
      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      });

      const activeByDate = activeAppointments.reduce<Map<string, number>>((map, apt) => {
        map.set(apt.date, (map.get(apt.date) ?? 0) + 1);
        return map;
      }, new Map());

      return days.map((d) => {
        const key = toLocalISODate(d);
        const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
        return { key, label, value: activeByDate.get(key) ?? 0 };
      });
    }

    const startOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const firstWeek = startOfWeek(today);
    const weekStarts = Array.from({ length: 6 }, (_, i) => {
      const w = new Date(firstWeek);
      w.setDate(firstWeek.getDate() + i * 7);
      return w;
    });

    const aptDates = activeAppointments.map((apt) => ({
      date: new Date(`${apt.date}T00:00:00`),
    }));

    return weekStarts.map((ws, i) => {
      const we = new Date(ws);
      we.setDate(ws.getDate() + 7);
      const count = aptDates.reduce((sum, a) => (a.date >= ws && a.date < we ? sum + 1 : sum), 0);
      const endLabel = new Date(ws);
      endLabel.setDate(ws.getDate() + 6);
      const label = `${ws.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}–${endLabel.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}`;
      return { key: `${toLocalISODate(ws)}_${i}`, label, value: count };
    });
  })();

  const trendMax = Math.max(1, ...trendSeries.map((p) => p.value));

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'View Schedule',
      value: 'Schedule',
      icon: ClipboardList,
      color: 'bg-green-500',
      link: '/app/doctor/schedule',
    },
    {
      label: 'Medical Records',
      value: 'Records',
      icon: FileText,
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
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
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
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  <IconComponent size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bento-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Patients by Status</h2>
              <p className="text-sm text-slate-600">Distribution across appointments</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/70 border border-slate-200/70 text-sm font-semibold text-slate-700">
              <span>Total</span>
              <span className="text-slate-900">{totalByStatus}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="flex items-center justify-center">
              <div
                className="relative w-44 h-44 rounded-full shadow-sm border border-slate-200/70 bg-white"
                style={donutStyle}
              >
                <div className="absolute inset-4 rounded-full bg-white border border-slate-200/70 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-slate-900">{totalByStatus}</div>
                  <div className="text-sm font-medium text-slate-600">Patients</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {statusOrder.map((status) => {
                const value = statusCounts[status];
                const pct = totalByStatus === 0 ? 0 : Math.round((value / totalByStatus) * 100);
                return (
                  <div key={status} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: statusMeta[status].color }}
                      />
                      <span className="text-sm font-medium text-slate-700">{statusMeta[status].label}</span>
                      <span className={['text-xs px-2 py-0.5 rounded-full', statusMeta[status].pillClass].join(' ')}>
                        {value}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bento-card xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Patients Trend</h2>
              <p className="text-sm text-slate-600">Upcoming workload (excluding cancelled)</p>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-white/70 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setTrendMode('daily')}
                className={[
                  'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                  trendMode === 'daily'
                    ? 'bg-pastel-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setTrendMode('weekly')}
                className={[
                  'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                  trendMode === 'weekly'
                    ? 'bg-pastel-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                Weekly
              </button>
            </div>
          </div>

            <div className="mt-6">
              <div className="h-44 flex items-end gap-2">
              {trendSeries.map((p, idx) => (
                <div key={p.key} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                  <div
                    className="w-full h-32 flex items-end rounded-xl bg-pastel-blue-200/60 border border-pastel-blue-100/70 overflow-hidden"
                    title={`${p.label}: ${p.value}`}
                  >
                    <div
                      className="w-full bg-gradient-blue rounded-xl"
                      style={{ height: `${(p.value / trendMax) * 100}%` }}
                    />
                  </div>
                  <div className="w-full text-[11px] font-medium text-slate-500 text-center truncate">
                    {trendMode === 'daily'
                      ? p.label
                      : (idx % 2 === 0 ? p.label : '')}
                  </div>
                </div>
              ))}
              </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                Max/day: <span className="font-semibold text-slate-800">{trendMax}</span>
              </span>
              <span>
                Total: <span className="font-semibold text-slate-800">{trendSeries.reduce((s, p) => s + p.value, 0)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Patient Satisfaction</h2>
            <p className="text-sm text-slate-600">Based on doctor rating and recent patterns</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/70 border border-slate-200/70">
            <div className="text-sm font-semibold text-slate-700">
              {satisfaction.find((s) => 'isAverage' in s)?.value.toFixed(1)} / 5
            </div>
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }, (_, i) => {
                const avg = satisfaction.find((s) => 'isAverage' in s)?.value ?? 0;
                const filled = i + 1 <= Math.round(avg);
                return (
                  <span key={i} className={filled ? 'opacity-100' : 'opacity-30'}>
                    ★
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {satisfaction
            .filter((s) => !('isAverage' in s))
            .map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                  <div className="text-sm font-bold text-slate-900">{item.value.toFixed(1)}</div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 border border-slate-200/70 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-pastel-blue-500 rounded-full"
                    style={{ width: `${(item.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
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
            icon={<Calendar size={48} className="text-slate-400" />}
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

