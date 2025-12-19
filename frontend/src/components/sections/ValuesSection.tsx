import React from 'react';
import { Users, Eye, Zap, Shield, Sparkles, Heart, CheckCircle2 } from 'lucide-react';

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const ValuesSection: React.FC = () => {
  const values: Value[] = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Compassion',
      description: 'We treat every patient with empathy and understanding',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Collaboration',
      description: 'Our team works together for the best patient outcomes',
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Transparency',
      description: 'Clear communication and honesty in all interactions',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Flexibility',
      description: 'Adaptable solutions tailored to your unique needs',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Trustworthy',
      description: 'Reliable and dependable healthcare you can count on',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Excellence',
      description: 'We strive for the highest standards in everything we do',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            A Simplified Path to Comprehensive Medical Care
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Experience personalized healthcare with our commitment to compassion, collaboration, and excellence in every interaction.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-blue-100 text-blue-600 mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Image Section */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👨‍⚕️👩‍⚕️</div>
                <p className="text-blue-900 font-semibold">Medical Team</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl p-8 h-96 flex flex-col justify-center">
              <h3 className="text-3xl font-bold mb-4">We're committed to delivering</h3>
              <p className="text-xl mb-8">
                the highest standard of medical care with sensitivity.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="flex-shrink-0" />
                  <span>Personalized Treatment Plans</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="flex-shrink-0" />
                  <span>Expert Medical Consultation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="flex-shrink-0" />
                  <span>24/7 Patient Support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
