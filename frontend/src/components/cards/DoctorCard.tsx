import React from 'react';
import type { Doctor } from '../../types';
import { Link } from 'react-router-dom';

interface DoctorCardProps {
  doctor: Doctor;
  showBookButton?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, showBookButton = true }) => {
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
          <div className="flex flex-wrap gap-2 mb-3">
            {doctor.schedule.slice(0, 3).map((sched, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-pastel-blue-50 text-pastel-blue-700 rounded-full"
              >
                {sched.day.slice(0, 3)} {sched.start}-{sched.end}
              </span>
            ))}
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

