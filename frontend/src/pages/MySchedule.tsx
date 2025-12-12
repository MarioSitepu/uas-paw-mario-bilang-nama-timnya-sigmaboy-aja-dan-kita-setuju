import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorsAPI } from '../services/api';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIMES = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const MySchedule: React.FC = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [doctorId, setDoctorId] = useState<number | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (user?.role !== 'doctor') return;

            try {
                // First we need the doctor ID, usually passed in user object but let's be safe
                const dashboardRes = await doctorsAPI.getSchedule(user.doctor_profile?.id || 0);
                // Note: Ideally API should have a /me/schedule endpoint, but using doctor ID work for now
                // Assuming user context has doctor_profile populated from login
                if (user.doctor_profile?.id) {
                    setDoctorId(user.doctor_profile.id);
                    const res = await doctorsAPI.getSchedule(user.doctor_profile.id);
                    setSchedule(res.data.schedule || {});
                } else {
                    // Fallback if doctor_profile not in context, fetch me
                    // Simplified for this demo
                    setMessage({ text: 'Doctor profile not found', type: 'error' });
                }
            } catch (err) {
                setMessage({ text: 'Failed to load schedule', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [user]);

    const toggleSlot = (day: string, time: string) => {
        setSchedule(prev => {
            const daySlots = prev[day] || [];
            const newSlots = daySlots.includes(time)
                ? daySlots.filter(t => t !== time)
                : [...daySlots, time].sort();

            return { ...prev, [day]: newSlots };
        });
    };

    const handleSave = async () => {
        if (!doctorId) return;
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await doctorsAPI.updateSchedule(doctorId, schedule);
            setMessage({ text: 'Schedule updated successfully', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Failed to update schedule', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading schedule...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Schedule</h1>
                    <p className="text-gray-500 mt-2">Set your availability for appointment bookings.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary px-6"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="space-y-6">
                    {DAYS.map(day => (
                        <div key={day} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">{day}</h3>
                            <div className="flex flex-wrap gap-2">
                                {TIMES.map(time => {
                                    const isSelected = schedule[day]?.includes(time);
                                    return (
                                        <button
                                            key={`${day}-${time}`}
                                            onClick={() => toggleSlot(day, time)}
                                            className={`px-3 py-1.5 text-sm rounded border transition-colors ${isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MySchedule;
