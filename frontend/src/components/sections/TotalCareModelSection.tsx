import medicalTeam from '../../assets/images/hero-medical-team.png';

export const TotalCareModelSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-56 h-56 lg:w-64 lg:h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 lg:w-80 lg:h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl lg:max-w-4xl mx-auto mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 lg:w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
            <div className="text-xs sm:text-sm font-bold text-blue-600 tracking-widest uppercase">Model Perawatan</div>
            <div className="w-10 lg:w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 lg:mb-5 leading-tight tracking-tight">
            Model Perawatan Total <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">CareHub™</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
            Memberikan perawatan yang berpusat pada pasien melalui bimbingan ahli, solusi inovatif, dan dukungan personalisasi di setiap langkah perjalanan.
          </p>
        </div>

        {/* Main Image with Overlay */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
          <div
            className="relative w-full h-[500px] sm:h-[600px] lg:h-[650px] bg-cover bg-center bg-no-repeat transform group-hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: `url(${medicalTeam})`,
              backgroundColor: '#dbeafe',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 animate-shimmer"></div>
          </div>

          {/* Overlay Text Box (Transparent with White Text) */}
          <div className="absolute bottom-8 lg:bottom-16 left-0 right-0 px-6 sm:px-10 text-center">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg sm:text-2xl lg:text-3xl text-white leading-relaxed font-semibold drop-shadow-lg">
                Model <span className="text-blue-400 font-bold">CareHub™</span> kami menyatukan dokter, spesialis, dan ahli kesehatan dalam satu tempat. Dari diagnosis hingga pemulihan, kami memastikan penyembuhan holistik dan kesejahteraan jangka panjang.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};
