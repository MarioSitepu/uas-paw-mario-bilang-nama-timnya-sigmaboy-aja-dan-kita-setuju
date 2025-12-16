import type { Appointment, AppointmentStatus, TimeSlot } from '../../types';

const MOCK_APPOINTMENTS_KEY = 'mock_appointments';

const initializeAppointments = (): Appointment[] => {
  const stored = localStorage.getItem(MOCK_APPOINTMENTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const appointmentsService = {
  async getAll(filters?: { patientId?: number; doctorId?: number; status?: AppointmentStatus }): Promise<Appointment[]> {
    const appointments = initializeAppointments();
    let filtered = [...appointments];

    if (filters?.patientId) {
      filtered = filtered.filter((a) => a.patientId === filters.patientId);
    }
    if (filters?.doctorId) {
      filtered = filtered.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters?.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    // Load doctor info
    const { doctorsService } = await import('./doctors.service');
    const doctors = await doctorsService.getAll();
    
    return filtered.map((apt) => ({
      ...apt,
      doctor: doctors.find((d) => d.id === apt.doctorId),
    }));
  },

  async getById(id: number): Promise<Appointment | null> {
    const appointments = initializeAppointments();
    const appointment = appointments.find((a) => a.id === id);
    
    if (!appointment) return null;

    const { doctorsService } = await import('./doctors.service');
    const doctor = await doctorsService.getById(appointment.doctorId);
    
    return { ...appointment, doctor: doctor || undefined };
  },

  async create(data: {
    doctorId: number;
    patientId: number;
    date: string;
    time: string;
    reason?: string;
  }): Promise<Appointment> {
    const appointments = initializeAppointments();
    const newAppointment: Appointment = {
      id: appointments.length > 0 ? Math.max(...appointments.map((a) => a.id)) + 1 : 1,
      doctorId: data.doctorId,
      patientId: data.patientId,
      date: data.date,
      time: data.time,
      status: 'pending',
      reason: data.reason,
      createdAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);
    localStorage.setItem(MOCK_APPOINTMENTS_KEY, JSON.stringify(appointments));

    const { doctorsService } = await import('./doctors.service');
    const doctor = await doctorsService.getById(data.doctorId);
    
    return { ...newAppointment, doctor: doctor || undefined };
  },

  async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    const appointments = initializeAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    
    if (index === -1) {
      throw new Error('Appointment not found');
    }

    appointments[index].status = status;
    localStorage.setItem(MOCK_APPOINTMENTS_KEY, JSON.stringify(appointments));

    const { doctorsService } = await import('./doctors.service');
    const doctor = await doctorsService.getById(appointments[index].doctorId);
    
    return { ...appointments[index], doctor: doctor || undefined };
  },

  async reschedule(id: number, date: string, time: string): Promise<Appointment> {
    const appointments = initializeAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    
    if (index === -1) {
      throw new Error('Appointment not found');
    }

    if (appointments[index].status === 'completed' || appointments[index].status === 'cancelled') {
      throw new Error('Cannot reschedule completed or cancelled appointment');
    }

    appointments[index].date = date;
    appointments[index].time = time;
    appointments[index].status = 'pending'; // Reset to pending after reschedule
    localStorage.setItem(MOCK_APPOINTMENTS_KEY, JSON.stringify(appointments));

    const { doctorsService } = await import('./doctors.service');
    const doctor = await doctorsService.getById(appointments[index].doctorId);
    
    return { ...appointments[index], doctor: doctor || undefined };
  },

  async cancel(id: number): Promise<void> {
    const appointments = initializeAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    
    if (index === -1) {
      throw new Error('Appointment not found');
    }

    if (appointments[index].status === 'completed') {
      throw new Error('Cannot cancel completed appointment');
    }

    appointments[index].status = 'cancelled';
    localStorage.setItem(MOCK_APPOINTMENTS_KEY, JSON.stringify(appointments));
  },

  async getAvailableTimeSlots(doctorId: number, date: string): Promise<TimeSlot[]> {
    // Get doctor schedule
    const { doctorsService } = await import('./doctors.service');
    const doctor = await doctorsService.getById(doctorId);
    if (!doctor) return [];

    // Get day name
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const schedule = doctor.schedule.find((s) => s.day === dayName);
    
    if (!schedule) return [];

    // Get existing appointments for this doctor and date
    const appointments = initializeAppointments();
    const bookedSlots = appointments
      .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
      .map((a) => a.time);

    // Generate time slots (every 30 minutes)
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = schedule.start.split(':').map(Number);
    const [endHour, endMin] = schedule.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push({
        time: timeStr,
        available: !bookedSlots.includes(timeStr),
      });

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    return slots;
  },
};

