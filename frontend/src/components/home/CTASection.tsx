import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const CTASection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    if (isAuthenticated) {
      navigate('/book-appointment');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-500 to-sky-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Take Control of Your Health?
        </h2>
        <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
          Join thousands of patients who trust us with their healthcare. Book your appointment today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBookAppointment}
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition transform hover:scale-105"
          >
            Book Appointment Now
          </button>
          {!isAuthenticated && (
            <Link
              to="/auth/register"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
