import React from 'react';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: '👨‍⚕️',
      title: 'Find Best Doctors',
      description: 'Browse through our network of qualified healthcare professionals',
    },
    {
      icon: '📅',
      title: 'Easy Booking',
      description: 'Schedule appointments at your convenience with flexible time slots',
    },
    {
      icon: '📋',
      title: 'Medical Records',
      description: 'Securely access and manage your complete medical history',
    },
    {
      icon: '🔔',
      title: 'Smart Reminders',
      description: 'Receive timely notifications about your appointments',
    },
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare solutions designed to make your medical journey easier and more efficient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-8 hover:shadow-lg transition transform hover:scale-105 border border-blue-200"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
