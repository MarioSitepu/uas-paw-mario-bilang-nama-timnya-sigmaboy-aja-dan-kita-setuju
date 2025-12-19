import React, { useState } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  content: string;
}

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Budi Santoso',
      role: 'Pengguna',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      content: 'Tim membuat setiap langkah bebas stres dan mendukung. Saya akhirnya merasa percaya diri dengan perawatan saya.',
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      role: 'Pengguna',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
      content: 'Pengalaman luar biasa. Platform ini telah membuat mengelola kesehatan saya jauh lebih mudah dan nyaman.',
    },
    {
      id: 3,
      name: 'Ahmad Fauzi',
      role: 'Pengguna',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      content: 'Profesional, peduli, dan efisien. CareHub telah mengubah cara saya mendekati kebutuhan kesehatan saya.',
    },
    {
      id: 4,
      name: 'Dewi Lestari',
      role: 'Pengguna',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
      content: 'Platform kesehatan terbaik yang pernah saya gunakan. Sederhana, efektif, dan benar-benar berpusat pada pasien.',
    },
    {
      id: 5,
      name: 'Rizki Pratama',
      role: 'Pengguna',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
      content: 'Layanan dan dukungan yang sangat baik. Dokter-dokternya berpengetahuan dan sistemnya sangat mudah digunakan.',
    },
    {
      id: 6,
      name: 'Maya Sari',
      role: 'Pengguna',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
      content: 'CareHub telah merevolusi pengalaman kesehatan saya. Sangat direkomendasikan untuk semua orang!',
    },
  ];

  const totalPages = Math.ceil(testimonials.length / 3);
  const startIndex = currentIndex * 3;
  const currentTestimonials = testimonials.slice(startIndex, startIndex + 3);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 lg:w-80 lg:h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 lg:w-80 lg:h-80 bg-blue-200/30 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 lg:w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
            <div className="text-xs sm:text-sm font-bold text-blue-600 tracking-widest uppercase">Testimoni</div>
            <div className="w-10 lg:w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 lg:mb-5 leading-tight tracking-tight">
            Cerita Nyata, Penyembuhan Nyata
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl lg:max-w-4xl mx-auto font-medium">
            Dari Komunitas Kami — Memberikan perawatan yang berpusat pada pasien melalui bimbingan ahli, solusi inovatif, dan dukungan personalisasi.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 lg:mb-12">
          {currentTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 lg:top-5 lg:right-5 w-9 h-9 lg:w-10 lg:h-10 bg-blue-50 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                <Quote className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              </div>

              <p className="text-gray-700 mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base font-medium relative z-10 pr-8">"{testimonial.content}"</p>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0 border-2 border-white">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base lg:text-lg group-hover:text-blue-600 transition-colors">{testimonial.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">{testimonial.role}</p>
                </div>
              </div>
              
              {/* Decorative gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2.5 lg:gap-3">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 w-8 lg:w-10 shadow-lg' 
                  : 'bg-gray-300 w-2 hover:bg-gray-400 hover:w-3'
              }`}
              aria-label={`Ke halaman ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
