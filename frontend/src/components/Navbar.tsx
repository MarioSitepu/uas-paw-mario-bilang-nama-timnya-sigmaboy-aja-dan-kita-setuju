import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleBookAppointment = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'patient' ? '/book-appointment' : '/dashboard');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-300 via-blue-200 to-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold text-xl text-slate-800">MedixWeb</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-700 hover:text-blue-600 transition text-sm font-medium">
              Home
            </Link>
            <a href="#about" className="text-slate-700 hover:text-blue-600 transition text-sm font-medium">
              About
            </a>
            <a href="#services" className="text-slate-700 hover:text-blue-600 transition text-sm font-medium">
              Services
            </a>
            <a href="#team" className="text-slate-700 hover:text-blue-600 transition text-sm font-medium">
              Our Team
            </a>
            <a href="#testimonials" className="text-slate-700 hover:text-blue-600 transition text-sm font-medium">
              Testimonials
            </a>
            <a href="#contact" className="text-slate-700 hover:text-blue-600 transition text-sm font-medium">
              Contact
            </a>
          </div>

          {/* CTA Button and Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-slate-700 hover:text-blue-600 transition text-sm font-medium">
                  {user?.name || 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-700 hover:text-red-600 transition text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
            <button
              onClick={handleBookAppointment}
              className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-full font-semibold text-sm hover:bg-blue-50 transition flex items-center gap-2"
            >
              Book Appointment
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Home
            </Link>
            <a href="#about" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              About
            </a>
            <a href="#services" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Services
            </a>
            <a href="#team" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Our Team
            </a>
            <a href="#testimonials" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Testimonials
            </a>
            <a href="#contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Contact
            </a>
            {isAuthenticated && (
              <>
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            )}
            <button
              onClick={handleBookAppointment}
              className="w-full mx-2 mt-2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-blue-700 transition"
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
