import React from 'react';
import { Search, Heart, Lock } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const AboutSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Doctor Search',
      description: 'Easily find specialists with the right expertise for your health needs',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Best Care',
      description: 'Receive personalized treatment from our network of compassionate experts',
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure Data',
      description: 'Your health information is protected with enterprise-grade encryption',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Image */}
          <div className="relative hidden lg:block">
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👨‍⚕️</div>
                <p className="text-blue-900 font-semibold">Healthcare Professional</p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">About Us</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              MedixWeb Clinic connects doctors and patients efficiently, providing smarter, safer, and more compassionate healthcare from diagnosis to recovery.
            </p>
            
            {/* Features Grid */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
