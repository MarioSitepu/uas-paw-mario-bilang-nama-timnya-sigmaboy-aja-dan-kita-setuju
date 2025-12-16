import type { Doctor, DoctorSchedule } from '../../types';

const MOCK_DOCTORS_KEY = 'mock_doctors';

const defaultDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiologist',
    photoUrl: 'https://i.pravatar.cc/150?img=47',
    rating: 4.8,
    location: 'Jakarta',
    clinic: 'Heart Care Clinic',
    bio: 'Experienced cardiologist with 15 years of practice.',
    schedule: [
      { day: 'Monday', start: '09:00', end: '17:00' },
      { day: 'Wednesday', start: '09:00', end: '17:00' },
      { day: 'Friday', start: '09:00', end: '17:00' },
    ],
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialization: 'Dermatologist',
    photoUrl: 'https://i.pravatar.cc/150?img=13',
    rating: 4.9,
    location: 'Bandung',
    clinic: 'Skin Health Center',
    bio: 'Specialist in skin conditions and cosmetic dermatology.',
    schedule: [
      { day: 'Tuesday', start: '10:00', end: '18:00' },
      { day: 'Thursday', start: '10:00', end: '18:00' },
      { day: 'Saturday', start: '09:00', end: '15:00' },
    ],
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialization: 'Pediatrician',
    photoUrl: 'https://i.pravatar.cc/150?img=45',
    rating: 4.7,
    location: 'Surabaya',
    clinic: 'Children\'s Medical Center',
    bio: 'Dedicated to children\'s health and wellness.',
    schedule: [
      { day: 'Monday', start: '08:00', end: '16:00' },
      { day: 'Tuesday', start: '08:00', end: '16:00' },
      { day: 'Wednesday', start: '08:00', end: '16:00' },
      { day: 'Thursday', start: '08:00', end: '16:00' },
    ],
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialization: 'Orthopedic',
    photoUrl: 'https://i.pravatar.cc/150?img=51',
    rating: 4.6,
    location: 'Yogyakarta',
    clinic: 'Bone & Joint Clinic',
    bio: 'Expert in bone and joint treatments.',
    schedule: [
      { day: 'Monday', start: '09:00', end: '17:00' },
      { day: 'Wednesday', start: '09:00', end: '17:00' },
      { day: 'Friday', start: '09:00', end: '17:00' },
    ],
  },
  {
    id: 5,
    name: 'Dr. Lisa Anderson',
    specialization: 'Neurologist',
    photoUrl: 'https://i.pravatar.cc/150?img=20',
    rating: 4.9,
    location: 'Jakarta',
    clinic: 'Neuro Care Center',
    bio: 'Specialist in neurological disorders.',
    schedule: [
      { day: 'Tuesday', start: '09:00', end: '17:00' },
      { day: 'Thursday', start: '09:00', end: '17:00' },
      { day: 'Saturday', start: '09:00', end: '13:00' },
    ],
  },
];

const initializeDoctors = (): Doctor[] => {
  const stored = localStorage.getItem(MOCK_DOCTORS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(MOCK_DOCTORS_KEY, JSON.stringify(defaultDoctors));
  return defaultDoctors;
};

export const doctorsService = {
  async getAll(): Promise<Doctor[]> {
    return initializeDoctors();
  },

  async getById(id: number): Promise<Doctor | null> {
    const doctors = initializeDoctors();
    return doctors.find((d) => d.id === id) || null;
  },

  async getSchedule(doctorId: number): Promise<DoctorSchedule[]> {
    const doctor = await this.getById(doctorId);
    return doctor?.schedule || [];
  },
};

