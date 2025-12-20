import React, { useState } from 'react';
import { Heart, Users, Eye, Zap, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WhatWeOfferSection: React.FC = () => {
  const [selectedDetail, setSelectedDetail] = useState<{ label: string, description: string } | null>(null);

  const values = [
    {
      label: 'Kasih Sayang',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      description: 'Kami menempatkan empati di garis depan setiap interaksi. Tim kami berdedikasi untuk mendengarkan kekhawatiran Anda dengan hati terbuka dan memberikan perawatan yang tidak hanya menyembuhkan fisik, tetapi juga menenangkan jiwa.'
    },
    {
      label: 'Kolaborasi',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Kesehatan Anda adalah upaya tim. Kami bekerja sama erat dengan Anda, melibatkan Anda dalam setiap keputusan medis, dan berkolaborasi antar spesialis untuk memastikan pendekatan holistik yang komprehensif.'
    },
    {
      label: 'Transparansi',
      icon: Eye,
      color: 'from-cyan-500 to-blue-500',
      description: 'Tidak ada istilah medis yang membingungkan atau biaya tersembunyi. Kami percaya pada komunikasi yang jelas, diagnosis yang jujur, dan rencana perawatan yang dapat Anda pahami sepenuhnya sejak hari pertama.'
    },
    {
      label: 'Fleksibilitas',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      description: 'Layanan kami dirancang untuk menyesuaikan dengan kehidupan Anda yang sibuk. Dengan penjadwalan online yang mudah dan opsi telemedis, mendapatkan perawatan berkualitas tidak pernah senyaman ini.'
    },
    {
      label: 'Keunggulan',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      description: 'Kami tidak pernah berkompromi pada kualitas. Dengan teknologi medis terkini dan tim dokter yang terus memperbarui keahlian mereka, kami memberikan standar perawatan kelas dunia yang Anda layak dapatkan.'
    },
  ];

  return (
    <>
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
                  return (
                    <button
                      key={value.label}
                      onClick={() => setSelectedDetail(value)}
                      className="w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3.5 lg:py-4 rounded-xl transition-all duration-300 relative overflow-hidden group bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-lg text-left"
                    >
                      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 bg-blue-100 group-hover:bg-blue-200">
                        <Icon size={18} className="text-blue-600" />
                      </div>
                      <span className="font-bold text-sm lg:text-base relative z-10">{value.label}</span>
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
                {/* Overlay Text Box removed */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              layoutId={`value-modal`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 p-8 text-center"
            >
              <button
                onClick={() => setSelectedDetail(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6">
                {(() => {
                  const matchedValue = values.find(v => v.label === selectedDetail.label);
                  const Icon = matchedValue ? matchedValue.icon : Sparkles;
                  return <Icon size={32} />;
                })()}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedDetail.label}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {selectedDetail.description}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
