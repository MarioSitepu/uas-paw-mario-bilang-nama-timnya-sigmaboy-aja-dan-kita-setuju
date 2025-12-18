import React from 'react';

export const AboutSection: React.FC = () => {
  const features = [
    { label: 'About Us' },
    { label: 'Quality' },
    { label: 'Services' },
    { label: 'Expertise' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="relative hidden lg:block">
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-7xl mb-4">🩺</div>
                <p className="text-blue-900 font-semibold text-sm">Comprehensive Care</p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">Comprehensive Care</h2>
            
            {/* Features Menu */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    {feature.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
