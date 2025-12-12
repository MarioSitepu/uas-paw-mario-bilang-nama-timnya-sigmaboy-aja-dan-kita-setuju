import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../services/api';

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    schedule: Record<string, string[]>;
}

const BookAppointment: React.FC = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [specializations, setSpecializations] = useState<string[]>([]);

    // Form State
    const [selectedDoctor, setSelectedDoctor] = useState<number | ''>('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [filterSpec, setFilterSpec] = useState('');

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, specsRes] = await Promise.all([
                    doctorsAPI.getAll(),
                    doctorsAPI.getSpecializations()
                ]);
                setDoctors(docsRes.data.doctors);
                setSpecializations(specsRes.data.specializations);
            } catch (err) {
                setError('Failed to load doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter doctors when specialization changes
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await doctorsAPI.getAll({ specialization: filterSpec });
                setDoctors(res.data.doctors);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDoctors();
    }, [filterSpec]);

    // Update available slots when doctor or date changes
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const doctor = doctors.find(d => d.id === Number(selectedDoctor));
            if (doctor && doctor.schedule) {
                // Get day of week (monday, tuesday, etc.)
                const date = new Date(selectedDate);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

                // Simple logic: Assume schedule is stored as simple array of slots for simplicity in this demo
                // Real implementation would check against existing appointments
                // Here we just show the doctor's general available slots for that day
                const slots = doctor.schedule[dayName] || [];
                setAvailableSlots(slots);
            }
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDoctor, selectedDate, doctors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctor || !selectedDate || !selectedTime) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await appointmentsAPI.create({
                doctor_id: Number(selectedDoctor),
                appointment_date: selectedDate,
                appointment_time: selectedTime,
                reason: reason
            });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading doctors...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
                <p className="text-gray-500 mt-2">Find a doctor and schedule your visit.</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Specialization Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Filter by Specialization</label>
                            <select
                                className="form-select"
                                value={filterSpec}
                                onChange={(e) => setFilterSpec(e.target.value)}
                            >
                                <option value="">All Specializations</option>
                                {specializations.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>

                        {/* Doctor Selection */}
                        <div className="form-group">
                            <label className="form-label">Select Doctor <span className="text-red-500">*</span></label>
                            <select
                                className="form-select"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(Number(e.target.value))}
                                required
                            >
                                <option value="">Choose a doctor...</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.name} ({doc.specialization})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Selection */}
                        <div className="form-group">
                            <label className="form-label">Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="form-input"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                                disabled={!selectedDoctor}
                            />
                        </div>

                        {/* Time Selection */}
                        <div className="form-group">
                            <label className="form-label">Time <span className="text-red-500">*</span></label>
                            <select
                                className="form-select"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                required
                                disabled={!selectedDate || availableSlots.length === 0}
                            >
                                <option value="">Select time...</option>
                                {availableSlots.length > 0 ? (
                                    availableSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>No slots available</option>
                                )}
                            </select>
                            {selectedDate && availableSlots.length === 0 && (
                                <p className="text-xs text-orange-500 mt-1">
                                    Doctor is not available on this day.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Reason for Visit</label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            placeholder="Briefly describe your symptoms or reason for visit..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`btn btn-primary ${submitting ? 'opacity-70' : ''}`}
                        >
                            {submitting ? 'Booking...' : 'Confirm Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
