import React, { useState, useEffect } from 'react';
import { Stethoscope, Award, Users, CheckCircle2, Clock, Shield, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Image gallery untuk slider
  const doctorImages = [
    {
      url: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80&auto=format&fit=crop',
      alt: 'Dokter profesional muslim wanita dengan jilbab di atas studio latar belakang putih - CareHub',
      title: 'Tim Medis Profesional',
      subtitle: 'Dokter berpengalaman dengan sertifikasi internasional'
    },
    {
      url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80&auto=format&fit=crop',
      alt: 'Dokter melakukan konsultasi dengan pasien',
      title: 'Konsultasi Berkualitas',
      subtitle: 'Pelayanan medis dengan pendekatan personal dan empati'
    },
    {
      url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80&auto=format&fit=crop',
      alt: 'Dokter menggunakan teknologi medis modern',
      title: 'Teknologi Medis Terkini',
      subtitle: 'Fasilitas lengkap dengan peralatan medis modern'
    },
    {
      url: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80&auto=format&fit=crop',
      alt: 'Seorang dokter muslim wanita dengan jilbab di atas studio latar belakang putih - Tim Multidisiplin CareHub',
      title: 'Tim Multidisiplin',
      subtitle: 'Kolaborasi berbagai spesialis untuk perawatan optimal'
    },
    {
      url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80&auto=format&fit=crop',
      alt: 'Dokter memberikan perawatan dengan penuh perhatian',
      title: 'Perawatan Berbasis Kasih Sayang',
      subtitle: 'Pendekatan holistik untuk kesehatan dan kesejahteraan'
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % doctorImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [doctorImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + doctorImages.length) % doctorImages.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % doctorImages.length);
  };

  const stats = [
    { value: '50+', label: 'Dokter Spesialis', icon: Stethoscope },
    { value: '10K+', label: 'Pasien Terlayani', icon: Users },
    { value: '98%', label: 'Tingkat Kepuasan', icon: Award },
    { value: '24/7', label: 'Layanan Tersedia', icon: Clock },
  ];

  const features = [
    {
      icon: Stethoscope,
      title: 'Tim Medis Berpengalaman',
      description: 'Dokter-dokter terbaik dengan sertifikasi internasional dan pengalaman bertahun-tahun dalam memberikan perawatan kesehatan berkualitas tinggi.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      hoverBg: 'hover:from-blue-100 hover:to-blue-200',
    },
    {
      icon: Award,
      title: 'Akreditasi & Standar Internasional',
      description: 'Terakreditasi dengan standar medis internasional, memastikan setiap prosedur medis dilakukan dengan protokol terbaik dan aman.',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      hoverBg: 'hover:from-emerald-100 hover:to-emerald-200',
    },
    {
      icon: Shield,
      title: 'Keamanan Data Medis',
      description: 'Sistem keamanan tingkat tinggi untuk melindungi rekam medis dan informasi pribadi pasien sesuai standar privasi internasional.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      hoverBg: 'hover:from-purple-100 hover:to-purple-200',
    },
    {
      icon: Heart,
      title: 'Perawatan Berbasis Kasih Sayang',
      description: 'Pendekatan holistik yang mengutamakan kenyamanan dan kesejahteraan pasien dengan perawatan yang penuh empati dan profesional.',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'from-rose-50 to-rose-100',
      hoverBg: 'hover:from-rose-100 hover:to-rose-200',
    },
  ];

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
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-1 h-7 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
            <div className="text-xs sm:text-sm font-bold text-blue-600 tracking-widest uppercase">Tentang CareHub</div>
            <div className="w-1 h-7 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Komitmen Kami untuk{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Kesehatan Anda
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            CareHub menghadirkan tim medis profesional berpengalaman yang siap memberikan perawatan kesehatan terbaik dengan teknologi terkini dan pendekatan yang penuh kasih sayang.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Left: Image Slider */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Slider Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <div 
                  className="flex transition-transform duration-700 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {doctorImages.map((image, index) => (
                    <div key={index} className="min-w-full h-full relative">
                      <img 
                        src={image.url} 
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-blue-900/10 to-transparent"></div>
                      
                      {/* Image Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
                        <h4 className="text-white font-bold text-lg mb-1">{image.title}</h4>
                        <p className="text-white/90 text-sm">{image.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all duration-300 hover:scale-110 group z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all duration-300 hover:scale-110 group z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {doctorImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-8 h-2 bg-white shadow-lg'
                        : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-300/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          {/* Right: Stats & Description */}
          <div className="order-1 lg:order-2">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Mengapa Memilih <span className="text-blue-600">CareHub?</span>
              </h3>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-6">
                Kami menghadirkan layanan kesehatan terdepan dengan tim dokter spesialis berpengalaman, teknologi medis terkini, dan komitmen penuh terhadap keselamatan serta kenyamanan setiap pasien.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 transition-transform duration-300 ${hoveredCard === index ? 'scale-110 rotate-3' : ''}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Indicators */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Terpercaya & Terakreditasi</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Setiap dokter di CareHub telah melalui proses seleksi ketat dan memiliki sertifikasi profesional. Kami berkomitmen memberikan perawatan medis berkualitas tinggi dengan standar internasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredCard === index + 10;
            
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden ${feature.hoverBg}`}
                onMouseEnter={() => setHoveredCard(index + 10)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                }}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : 'group-hover:scale-105 group-hover:rotate-3'}`}>
                    <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-900 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                  
                  {/* Sparkle effect on hover */}
                  {isHovered && (
                    <div className="absolute top-4 right-4">
                      <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};
