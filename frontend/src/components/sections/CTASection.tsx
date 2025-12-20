import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated && user?.role) {
      const role = user.role.toLowerCase();
      if (role === 'doctor') {
        navigate('/app/doctor/dashboard');
      } else if (role === 'patient') {
        navigate('/app/patient/dashboard');
      } else {
        navigate('/app');
      }
    } else {
      navigate('/auth/register');
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-500 to-blue-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare?
            </h2>
            <p className="text-xl text-blue-50 mb-8 leading-relaxed">
              Join thousands of patients who have already discovered better healthcare with MedixWeb. Book your appointment today and experience compassionate, expert care.
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Stats */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <p className="text-blue-50">Active Patients</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <p className="text-blue-50">Verified Doctors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <p className="text-blue-50">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
