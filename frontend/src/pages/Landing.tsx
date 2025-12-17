import React from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: '👨‍⚕️',
      title: 'Find Best Doctors',
      description: 'Browse through our network of qualified healthcare professionals',
    },
    {
      icon: '📅',
      title: 'Easy Booking',
      description: 'Book appointments in just a few clicks with real-time availability',
    },
    {
      icon: '📋',
      title: 'Medical Records',
      description: 'Access your complete medical history and records securely',
    },
    {
      icon: '🔔',
      title: 'Reminders',
      description: 'Get notified about your upcoming appointments',
    },
  ];

  const stats = [
    { number: '500+', label: 'Doctors' },
    { number: '10K+', label: 'Patients' },
    { number: '50K+', label: 'Appointments' },
    { number: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-gradient-pastel">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-800 mb-6">
              Your Health, <span className="text-pastel-blue-600">Our Priority</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Book appointments with trusted doctors. Manage your health records. All in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="px-8 py-4 bg-gradient-blue text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                to="/auth/login"
                className="px-8 py-4 bg-white text-pastel-blue-700 rounded-xl font-semibold text-lg hover:shadow-lg transition-all border-2 border-pastel-blue-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-pastel-blue-600 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-800 mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bento-card group hover:scale-105 transition-transform"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients who trust us with their healthcare needs
          </p>
          <Link
            to="/auth/register"
            className="inline-block px-8 py-4 bg-white text-pastel-blue-700 rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

