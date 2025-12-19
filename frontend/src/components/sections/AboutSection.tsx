import React from 'react';
import { Heart, Shield, TrendingUp } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Animated DNA Pattern Background */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <g stroke="currentColor" strokeWidth="3" fill="none" className="text-blue-600">
            <path d="M 100 200 Q 150 100, 200 200 T 300 200 T 400 200 T 500 200 T 600 200 T 700 200" className="animate-dna" />
            <path d="M 100 200 Q 150 300, 200 200 T 300 200 T 400 200 T 500 200 T 600 200 T 700 200" className="animate-dna-reverse" />
            <path d="M 100 400 Q 150 300, 200 400 T 300 400 T 400 400 T 500 400 T 600 400 T 700 400" className="animate-dna" />
            <path d="M 100 400 Q 150 500, 200 400 T 300 400 T 400 400 T 500 400 T 600 400 T 700 400" className="animate-dna-reverse" />
            <path d="M 100 600 Q 150 500, 200 600 T 300 600 T 400 600 T 500 600 T 600 600 T 700 600" className="animate-dna" />
            <path d="M 100 600 Q 150 700, 200 600 T 300 600 T 400 600 T 500 600 T 600 600 T 700 600" className="animate-dna-reverse" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-12 lg:mb-16">
          {/* Left Content */}
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
              <div className="text-xs sm:text-sm font-bold text-blue-600 tracking-widest uppercase">Tentang Kami</div>
            </div>
            
            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-8 max-w-lg font-medium">
              CareHub menghubungkan dokter dan pasien dengan mudah, menyediakan layanan kesehatan yang lebih cerdas, aman, dan penuh kasih sayang dari diagnosis hingga pemulihan penuh.
            </p>

            {/* Impact Stats */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">Dampak Kami</div>
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <div className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">50+</div>
                <div className="flex gap-2 ml-4 lg:ml-6">
                  <button className="p-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md group">
                    <ChevronLeft size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </button>
                  <button className="p-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md group">
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </button>
                </div>
              </div>
              <p className="text-base sm:text-lg text-gray-700 font-semibold">Profesional Kesehatan yang Mendukung Kehidupan di Seluruh Dunia</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden shadow-2xl border-8 border-white transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80" 
                  alt="Dokter profesional"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 bg-blue-200/50 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-3 -left-3 w-24 h-24 sm:w-28 sm:h-28 bg-blue-300/50 rounded-full blur-xl animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Smart Care Card */}
          <div className="group bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-2xl flex items-center justify-center mb-4 lg:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Heart className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Perawatan Cerdas</h3>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              Pelacakan kesehatan digital yang cerdas, wawasan akurat, dan hasil yang lebih baik.
            </p>
          </div>

          {/* Secure Data Card */}
          <div className="group bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-2xl flex items-center justify-center mb-4 lg:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Data Aman</h3>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              Melindungi data pasien melalui sistem kesehatan digital yang aman dan sesuai standar HIPAA.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .animate-dna {
          stroke-dasharray: 10 5;
          animation: dna 20s linear infinite;
        }
        .animate-dna-reverse {
          stroke-dasharray: 10 5;
          animation: dna 20s linear infinite reverse;
        }
        @keyframes dna {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 100; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};
