import React, { useState } from 'react';
import type { Doctor } from '../../types';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  showBookButton?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, showBookButton = true }) => {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);

  // Format schedule to show only available days with times
  const formatScheduleForDisplay = () => {
    if (!doctor.schedule || typeof doctor.schedule !== 'object') {
      return [];
    }

    return Object.entries(doctor.schedule)
      .map(([day, dayData]: [string, any]) => {
        // Check if day is available
        if (!dayData || dayData.available === false) {
          return null;
        }

        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const startTime = dayData.startTime || '09:00';
        const endTime = dayData.endTime || '17:00';

        return {
          day: dayName,
          time: `${startTime}-${endTime}`
        };
      })
      .filter((item) => item !== null) as Array<{ day: string; time: string }>;
  };

  const scheduleDisplay = formatScheduleForDisplay();

  return (
    <div className="bento-card group">
      <div className="flex items-start gap-4">
        <img
          src={doctor.photoUrl}
          alt={doctor.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">{doctor.name}</h3>
          <p className="text-sm text-pastel-blue-600 font-medium mb-2">{doctor.specialization}</p>
          <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
            <span className="flex items-center gap-1">
              <span>⭐</span>
              <span className="font-medium">{doctor.rating}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span>{doctor.clinic}</span>
            </span>
          </div>
          {doctor.bio && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{doctor.bio}</p>
          )}
          
          {/* Schedule Dropdown */}
          <div className="mb-3 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <span className="text-xs font-medium text-slate-700">📅 Available Schedule</span>
              <ChevronDown
                size={16}
                className={`text-slate-600 transition-transform ${
                  isScheduleExpanded ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {isScheduleExpanded && (
              <div className="px-3 py-2 bg-white border-t border-slate-200 space-y-1">
                {scheduleDisplay.length > 0 ? (
                  scheduleDisplay.map((sched, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-700 py-1 px-2 bg-pastel-blue-50 rounded flex justify-between items-center"
                    >
                      <span className="font-medium">{sched.day}</span>
                      <span className="text-pastel-blue-600 font-semibold">{sched.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-2">No available schedule</p>
                )}
              </div>
            )}
          </div>

          {showBookButton && (
            <Link
              to={`/app/patient/appointments/new?doctorId=${doctor.id}`}
              className="inline-block w-full text-center px-4 py-2 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Book Appointment
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

