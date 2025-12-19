import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <>
      {/* Hero 1 - Team Image Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-200 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-slate-800 z-10">
              {/* Trust Badge */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center text-xs font-bold text-blue-600">
                    👨
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center text-xs font-bold text-blue-600">
                    👩
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center text-xs font-bold text-blue-600">
                    👨
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center text-xs font-bold text-blue-600">
                    👩
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-700">Trusted by 135k+ people</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-slate-800">
                Your Trusted Partner in Modern Healthcare
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
                Accessible, modern medical care — where technology meets compassion. Book appointments, view reports, and stay healthy from anywhere.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div>
                  <div className="text-4xl font-bold text-blue-600">500+</div>
                  <p className="text-slate-600 text-sm mt-2">Expert Doctors</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600">135K+</div>
                  <p className="text-slate-600 text-sm mt-2">Happy Patients</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600">97%</div>
                  <p className="text-slate-600 text-sm mt-2">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right - Team Image with Fade */}
            <div className="relative h-96 lg:h-full min-h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-blue-100 opacity-30 rounded-3xl"></div>
              <img
                src="/team-image.png"
                alt="Healthcare Team"
                className="w-full h-auto object-cover rounded-3xl shadow-2xl"
              />
              {/* Fade effect on right side */}
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-blue-200 to-transparent rounded-r-3xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero 2 - Doctor/Medical Professional Section */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Doctor Image with Fade */}
            <div className="relative h-96 lg:h-full min-h-96 flex items-center justify-center order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-100 opacity-30 rounded-3xl"></div>
              <img
                src="/doctor-team.png"
                alt="Medical Professional"
                className="w-full h-auto object-cover rounded-3xl shadow-2xl"
              />
              {/* Fade effect on left side */}
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-blue-50 to-transparent rounded-l-3xl opacity-60"></div>
            </div>

            {/* Right - Content */}
            <div className="text-slate-800 z-10 order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                Professional Medical Care
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our dedicated team of healthcare professionals is committed to providing you with the highest quality of care. With years of experience and cutting-edge technology, we ensure your health is in good hands.
              </p>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏥</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">State-of-the-Art Facilities</h3>
                    <p className="text-slate-600">Modern equipment and comfortable environments for your care</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">24/7 Availability</h3>
                    <p className="text-slate-600">Always available when you need us, day or night</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Expert Team</h3>
                    <p className="text-slate-600">Highly qualified medical professionals with specialized expertise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
