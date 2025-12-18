import React, { type ReactNode } from 'react';
import { UserRole } from '../types';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <NavLink to="/" className="text-xl font-bold text-primary-600 flex items-center gap-2">
                                <span className="text-2xl">🏥</span>
                                <span>Clinic App</span>
                            </NavLink>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            {isAuthenticated ? (
                                <>
                                    <NavLink
                                        to="/"
                                        className={({ isActive }) =>
                                            `text-sm font-medium hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-600'}`
                                        }
                                    >
                                        Dashboard
                                    </NavLink>

                                    {user?.role === UserRole.PATIENT && (
                                        <NavLink
                                            to="/book-appointment"
                                            className={({ isActive }) =>
                                                `text-sm font-medium hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-600'}`
                                            }
                                        >
                                            Book Appointment
                                        </NavLink>
                                    )}

                                    {user?.role === UserRole.DOCTOR && (
                                        <NavLink
                                            to="/my-schedule"
                                            className={({ isActive }) =>
                                                `text-sm font-medium hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-600'}`
                                            }
                                        >
                                            My Schedule
                                        </NavLink>
                                    )}

                                    {/* User Profile Dropdown */}
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                {user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{user?.name}</span>
                                        </button>

                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <NavLink to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                                        Login
                                    </NavLink>
                                    <NavLink to="/register" className="btn btn-primary text-sm">
                                        Register
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 p-4 md:p-8">
                <div className="container mx-auto">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Clinic Appointment System. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
