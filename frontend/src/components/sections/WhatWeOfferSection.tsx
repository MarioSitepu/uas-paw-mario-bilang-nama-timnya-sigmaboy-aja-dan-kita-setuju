import React from 'react';
import { Heart, Users, Eye, Zap, Sparkles } from 'lucide-react';

export const WhatWeOfferSection: React.FC = () => {
  const values = [
    { label: 'Kasih Sayang', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { label: 'Kolaborasi', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Transparansi', icon: Eye, color: 'from-cyan-500 to-blue-500' },
    { label: 'Fleksibilitas', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { label: 'Keunggulan', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  ];

  const [selectedValue, setSelectedValue] = React.useState('Kolaborasi');

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
              <div className="text-xs sm:text-sm font-bold text-blue-600 tracking-widest uppercase">Layanan Kami</div>
            </div>
            
            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 lg:mb-5 leading-tight tracking-tight">
              Jalan Sederhana Menuju Perawatan Medis Menyeluruh
            </h2>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 lg:mb-10 leading-relaxed font-medium">
              Memberikan perawatan yang berpusat pada pasien melalui bimbingan ahli, solusi inovatif, dan dukungan personalisasi di setiap langkah perjalanan.
            </p>

            {/* Values List */}
            <div className="space-y-2.5 lg:space-y-3">
              {values.map((value) => {
                const Icon = value.icon;
                const isSelected = selectedValue === value.label;
                return (
                  <button
                    key={value.label}
                    onClick={() => setSelectedValue(value.label)}
                    className={`w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3.5 lg:py-4 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                        ? `bg-gradient-to-r ${value.color} text-white shadow-2xl transform scale-[1.02]`
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected ? 'bg-white/20 shadow-lg' : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                      <Icon size={18} className={isSelected ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <span className="font-bold text-sm lg:text-base relative z-10">{value.label}</span>
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Image with Overlay */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              {/* Image */}
              <div 
                className="w-full h-[450px] sm:h-[500px] lg:h-[550px] bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>

              {/* Overlay Text Box */}
              <div className="absolute bottom-6 lg:bottom-8 left-6 lg:left-8 right-6 lg:right-8 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 rounded-2xl p-6 lg:p-8 text-white shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                <p className="text-lg lg:text-xl leading-relaxed mb-5 lg:mb-6 font-semibold">
                  Kami berkomitmen untuk memberikan standar perawatan medis tertinggi dengan kepekaan.
                </p>
                
                {/* Value Tags */}
                <div className="flex flex-wrap gap-2.5 lg:gap-3">
                  {values.map((value) => (
                    <span
                      key={value.label}
                      className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white/30 backdrop-blur-sm rounded-full text-xs lg:text-sm font-bold border border-white/40 shadow-lg hover:bg-white/40 transition-all duration-300 cursor-pointer"
                    >
                      {value.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
