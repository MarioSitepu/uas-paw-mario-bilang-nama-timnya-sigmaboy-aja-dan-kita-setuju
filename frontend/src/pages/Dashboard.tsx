import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { Link } from 'react-router-dom';

interface DashboardData {
    role: string;
    user: any;
    stats: any;
    upcoming_appointments?: any[];
    today_schedule?: any[];
    doctor?: any;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.get();
                setData(response.data);
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-10">{error}</div>;
    }

    if (!data) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here's what's happening with your appointments today.
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user?.role === 'patient' && (
                    <>
                        <div className="card border-l-4 border-blue-500">
                            <h3 className="text-gray-500 text-sm font-medium">Upcoming Appointments</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.upcoming_count}</p>
                        </div>
                        <div className="card border-l-4 border-green-500">
                            <h3 className="text-gray-500 text-sm font-medium">Completed Visits</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.completed_appointments}</p>
                        </div>
                        <div className="card border-l-4 border-purple-500">
                            <h3 className="text-gray-500 text-sm font-medium">Total Appointments</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.total_appointments}</p>
                        </div>
                    </>
                )}

                {user?.role === 'doctor' && (
                    <>
                        <div className="card border-l-4 border-blue-500">
                            <h3 className="text-gray-500 text-sm font-medium">Today's Appointments</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.today_appointments}</p>
                        </div>
                        <div className="card border-l-4 border-orange-500">
                            <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.pending_appointments}</p>
                        </div>
                        <div className="card border-l-4 border-green-500">
                            <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.total_patients}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">
                                {user?.role === 'patient' ? 'Upcoming Appointments' : "Today's Schedule"}
                            </h2>
                            <Link to={user?.role === 'patient' ? '/book-appointment' : '/my-schedule'} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                {user?.role === 'patient' ? '+ New Appointment' : 'View Full Schedule'}
                            </Link>
                        </div>

                        {user?.role === 'patient' ? (
                            <div className="space-y-4">
                                {data.upcoming_appointments && data.upcoming_appointments.length > 0 ? (
                                    data.upcoming_appointments.map((apt: any) => (
                                        <div key={apt.id} className="flex items-start p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {new Date(apt.appointment_date).getDate()}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <div className="flex justify-between">
                                                    <h3 className="font-semibold text-gray-900">Dr. {apt.doctor_name}</h3>
                                                    <span className={`badge ${apt.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{apt.doctor_specialization}</p>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <span className="mr-4">🕒 {apt.appointment_time}</span>
                                                    <span>📅 {new Date(apt.appointment_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No upcoming appointments.</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Doctor's Today Schedule */}
                                {data.today_schedule && data.today_schedule.length > 0 ? (
                                    data.today_schedule.map((apt: any) => (
                                        <div key={apt.id} className="flex items-start p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {apt.appointment_time}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <div className="flex justify-between">
                                                    <h3 className="font-semibold text-gray-900">{apt.patient_name}</h3>
                                                    <span className={`badge ${apt.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{apt.reason || 'Check-up'}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <Link to={`/consultation/${apt.id}`} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                                                        Start Consultation
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No appointments for today.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Quick Actions / Info */}
                <div className="space-y-6">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                        <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                        <p className="text-blue-100 text-sm mb-4">
                            Our support team is available 24/7 to assist you with any questions.
                        </p>
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors w-full">
                            Contact Support
                        </button>
                    </div>

                    <div className="card">
                        <h3 className="font-bold text-gray-800 mb-3">Health Tips</h3>
                        <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                            <li>Drink at least 8 glasses of water daily.</li>
                            <li>Exercise for 30 minutes every day.</li>
                            <li>Get 7-8 hours of sleep each night.</li>
                            <li>Eat a balanced diet rich in vegetables.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
