import type { MedicalRecord } from '../../types';

const MOCK_RECORDS_KEY = 'mock_medical_records';

const initializeRecords = (): MedicalRecord[] => {
  const stored = localStorage.getItem(MOCK_RECORDS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const recordsService = {
  async getAll(filters?: { doctorId?: number; patientId?: number }): Promise<MedicalRecord[]> {
    const records = initializeRecords();
    let filtered = [...records];

    if (filters?.doctorId) {
      filtered = filtered.filter((r) => r.doctor_id === filters.doctorId);
    }
    if (filters?.patientId) {
      filtered = filtered.filter((r) => r.patient_id === filters.patientId);
    }

    return filtered;
  },

  async getById(id: number): Promise<MedicalRecord | null> {
    const records = initializeRecords();
    return records.find((r) => r.id === id) || null;
  },

  async getByAppointment(appointmentId: number): Promise<MedicalRecord | null> {
    const records = initializeRecords();
    return records.find((r) => r.appointment_id === appointmentId) || null;
  },

  async create(data: {
    appointmentId: number;
    doctorId: number;
    patientId: number;
    diagnosis: string;
    notes: string;
    symptoms?: string;
    treatment?: string;
    prescription?: string;
  }): Promise<MedicalRecord> {
    // Check if appointment is completed
    const { appointmentsService } = await import('./appointments.service');
    const appointment = await appointmentsService.getById(data.appointmentId);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'completed') {
      throw new Error('Medical record can only be created for completed appointments');
    }

    // Check if record already exists
    const existing = await this.getByAppointment(data.appointmentId);
    if (existing) {
      throw new Error('Medical record already exists for this appointment');
    }

    const records = initializeRecords();
    const newRecord: MedicalRecord = {
      id: records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1,
      appointment_id: data.appointmentId,
      doctor_id: data.doctorId,
      patient_id: data.patientId,
      diagnosis: data.diagnosis,
      notes: data.notes,
      symptoms: data.symptoms,
      treatment: data.treatment,
      prescription: data.prescription,
      created_at: new Date().toISOString(),
    };

    records.push(newRecord);
    localStorage.setItem(MOCK_RECORDS_KEY, JSON.stringify(records));

    return newRecord;
  },

  async update(id: number, data: Partial<Omit<MedicalRecord, 'id' | 'appointment_id' | 'doctor_id' | 'patient_id' | 'created_at'>>): Promise<MedicalRecord> {
    const records = initializeRecords();
    const index = records.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Medical record not found');
    }

    records[index] = { ...records[index], ...data };
    localStorage.setItem(MOCK_RECORDS_KEY, JSON.stringify(records));

    return records[index];
  },
};

