import React from 'react';

export const ComprehensiveCareSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Care
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Accessible, modern medical care — where technology meets compassion. Book appointments, view reports, and stay healthy from anywhere.
            </p>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Booking</h3>
                  <p className="text-gray-600">Book appointments in just a few clicks with real-time availability</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Medical Records</h3>
                  <p className="text-gray-600">Access your complete medical history and records securely</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reminders</h3>
                  <p className="text-gray-600">Get notified about your upcoming appointments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Stats Cards */}
          <div className="space-y-6">
            {/* Main Trust Card */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-8 text-white shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm font-medium opacity-90 mb-2">Trusted Care Rate</p>
                  <div className="text-6xl font-bold">97%</div>
                </div>
                <button className="text-white opacity-60 hover:opacity-100">
                  <span className="text-2xl">✕</span>
                </button>
              </div>
              <p className="text-sm opacity-90">Our patients trust us and are consistently satisfied with our treatment & support.</p>
            </div>

            {/* Attribute Pills */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-300 to-blue-400 rounded-3xl p-6 text-white shadow-lg relative">
                <button className="absolute top-4 right-4 text-white opacity-60 hover:opacity-100">
                  <span>✕</span>
                </button>
                <div className="text-sm font-medium opacity-90">Caring</div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">Personalized</span>
              </div>

              <div className="col-span-2 bg-gradient-to-br from-teal-200 to-blue-200 rounded-3xl p-6 text-white shadow-lg relative flex items-center justify-between">
                <button className="absolute top-4 right-4 text-white opacity-60 hover:opacity-100">
                  <span>✕</span>
                </button>
                <span className="text-sm font-medium opacity-90">Reliable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
