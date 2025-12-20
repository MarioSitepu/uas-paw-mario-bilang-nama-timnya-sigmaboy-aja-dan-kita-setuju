export const UserRole = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  profile_photo_url?: string;
  doctor_profile?: {
    id: number;
    specialization: string;
    [key: string]: any;
  };
}

export interface Doctor {
  id: number;
  userId: number;
  name: string;
  specialization: string;
  photoUrl: string;
  rating: number;
  location: string;
  clinic: string;
  schedule: DoctorSchedule[];
  bio?: string;
  profile_photo_url?: string;
}

export interface DoctorSchedule {
  day: string; // 'Monday', 'Tuesday', etc.
  start: string; // '09:00'
  end: string; // '17:00'
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  doctor?: Doctor;
  patient?: User;
  date: string; // ISO date string
  time: string; // '09:00'
  status: AppointmentStatus;
  reason?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: number;
  appointment_id: number;
  diagnosis: string;
  notes: string;
  symptoms?: string;
  treatment?: string;
  prescription?: string;
  created_at?: string;
  doctor_id?: number;
  patient_id?: number;
  patient?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

