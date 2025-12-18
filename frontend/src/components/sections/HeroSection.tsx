import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-400 to-blue-500 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                <CheckCircle size={16} />
                Join 10,000+ happy patients
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Trusted Partner in Modern Healthcare
            </h1>
            
            <p className="text-lg text-blue-50 mb-8 leading-relaxed">
              Experience comprehensive care, compassionate support, and cutting-edge expertise supporting your best health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/patient/doctors-list"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Explore Services
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Book Appointment
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold mb-2">97%</div>
                <p className="text-blue-100 text-sm">Patient Satisfaction</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <p className="text-blue-100 text-sm">Expert Doctors</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">50K+</div>
                <p className="text-blue-100 text-sm">Happy Patients</p>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="relative hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 h-96 flex items-center justify-center border border-white/20">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">👨‍👩‍👧</div>
                <p className="text-sm">Healthcare Family Image</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
