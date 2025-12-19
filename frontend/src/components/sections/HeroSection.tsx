import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1920&q=80&auto=format&fit=crop" 
          alt="Pasien sembuh dan sehat"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/88 via-blue-800/78 to-blue-900/88"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-blue-800/15"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Trusted By Section */}
            <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" 
                    alt="User 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" 
                    alt="User 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces" 
                    alt="User 3"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap">Dipercaya oleh 135+ orang</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-5 lg:mb-6 leading-[1.1] tracking-tight">
              <span className="block bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent animate-gradient">
                Partner Terpercaya Anda
              </span>
              <span className="block mt-1 sm:mt-2">dalam Layanan Kesehatan Modern</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-50 mb-6 sm:mb-7 lg:mb-8 leading-relaxed max-w-xl font-medium">
              Layanan medis modern yang mudah diakses — di mana teknologi bertemu dengan kasih sayang. Buat janji temu, lihat laporan, dan tetap sehat dari mana saja.
            </p>

            {/* CTA Button */}
            <Link
              to="/patient/doctors-list"
              className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all hover:shadow-2xl mb-8 sm:mb-10 lg:mb-12 transform hover:scale-105 duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">Jelajahi Layanan</span>
              <ArrowRight size={18} className="sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Link>

            {/* Comprehensive Care Label */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="w-8 sm:w-10 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              <div className="text-[10px] xs:text-xs sm:text-sm text-blue-200 font-semibold uppercase tracking-widest whitespace-nowrap">Perawatan Menyeluruh</div>
              <div className="w-8 sm:w-10 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            </div>
          </div>

          {/* Right Glassmorphism Cards */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-5 mt-8 lg:mt-0">
            {/* Trusted Care Rate Card */}
            <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 backdrop-blur-xl bg-white/15 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/20">
              <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg">97%</div>
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-300 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <p className="text-white/95 text-xs sm:text-sm lg:text-base leading-relaxed font-medium drop-shadow-md">
                Pasien mempercayai kami dan secara konsisten puas dengan perawatan & dukungan kami.
              </p>
            </div>

            {/* Tags Card */}
            <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 backdrop-blur-xl bg-white/15 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/20">
              <div className="flex flex-wrap gap-2 sm:gap-2.5 lg:gap-3">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 bg-white/25 hover:bg-white/35 rounded-full text-[10px] xs:text-xs lg:text-sm text-white font-bold shadow-md hover:scale-110 transition-all duration-300 cursor-pointer backdrop-blur-sm border border-white/20">
                  Kardiologi
                  <X size={12} className="sm:w-3.5 sm:h-3.5 opacity-80 hover:opacity-100 transition-opacity" />
                </span>
                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 bg-white/30 hover:bg-white/40 rounded-full text-[10px] xs:text-xs lg:text-sm text-white font-bold shadow-md hover:scale-110 transition-all duration-300 cursor-pointer backdrop-blur-sm border border-white/20">
                  Personalisasi
                  <X size={12} className="sm:w-3.5 sm:h-3.5 opacity-80 hover:opacity-100 transition-opacity" />
                </span>
                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 bg-white/25 hover:bg-white/35 rounded-full text-[10px] xs:text-xs lg:text-sm text-white font-bold shadow-md hover:scale-110 transition-all duration-300 cursor-pointer backdrop-blur-sm border border-white/20">
                  Global
                  <X size={12} className="sm:w-3.5 sm:h-3.5 opacity-80 hover:opacity-100 transition-opacity" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </section>
  );
};
