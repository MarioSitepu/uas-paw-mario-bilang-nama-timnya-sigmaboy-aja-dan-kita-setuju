import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-blue-900 via-blue-950 to-blue-950 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 lg:w-80 lg:h-80 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 lg:w-80 lg:h-80 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12 lg:mb-16">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 text-xl lg:text-2xl font-bold mb-5 lg:mb-6 hover:opacity-80 transition-opacity group">
              <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-blue-900 font-bold text-lg lg:text-xl">C</span>
              </div>
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                CareHub
              </span>
            </Link>
            <p className="text-blue-200 text-sm lg:text-base leading-relaxed mb-3 lg:mb-4">
              Platform kesehatan modern yang menghubungkan Anda dengan perawatan terbaik.
            </p>
            <div className="flex items-center gap-2 text-blue-300 text-xs lg:text-sm">
              <Heart className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-red-500 text-red-500 animate-pulse" />
              <span>Dibuat dengan cinta untuk kesehatan Anda</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base lg:text-lg font-bold mb-5 lg:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 lg:h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              Tautan Cepat
            </h4>
            <ul className="space-y-2.5 lg:space-y-3">
              {['Beranda', 'Tentang', 'Layanan', 'Blog', 'Kontak'].map((link) => (
                <li key={link}>
                  <a 
                    href={link === 'Beranda' ? '/' : `#${link.toLowerCase()}`} 
                    className="text-blue-200 hover:text-white transition-colors text-sm lg:text-base font-medium hover:translate-x-1 inline-block transform duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-base lg:text-lg font-bold mb-5 lg:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 lg:h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              Layanan Kami
            </h4>
            <ul className="space-y-2.5 lg:space-y-3">
              {['Pengobatan Umum', 'Perawatan Gigi', 'Pediatri', 'Kesehatan Wanita', 'Kardiologi', 'Fisioterapi'].map((service) => (
                <li key={service}>
                  <a 
                    href="#" 
                    className="text-blue-200 hover:text-white transition-colors text-sm lg:text-base font-medium hover:translate-x-1 inline-block transform duration-200"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctors */}
          <div>
            <h4 className="text-base lg:text-lg font-bold mb-5 lg:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 lg:h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              Dokter
            </h4>
            <ul className="space-y-2.5 lg:space-y-3">
              {['Spesialis Kami', 'Kualifikasi & Keahlian', 'Ulasan Pasien', 'Bergabung dengan Tim'].map((item) => (
                <li key={item}>
                  <a 
                    href={item === 'Spesialis Kami' ? '#our-team' : item === 'Ulasan Pasien' ? '#testimonials' : '#'} 
                    className="text-blue-200 hover:text-white transition-colors text-sm lg:text-base font-medium hover:translate-x-1 inline-block transform duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-800/50 pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6">
            {/* Copyright */}
            <div className="text-blue-200 text-sm lg:text-base text-center md:text-left">
              <p className="mb-1.5 lg:mb-2 font-semibold">&copy; {currentYear} CareHub. Hak cipta dilindungi.</p>
              <p className="font-medium flex items-center gap-2 justify-center md:justify-start">
                <Heart className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-red-500 text-red-500" />
                Dirancang dengan penuh kasih untuk komunitas yang lebih sehat.
              </p>
            </div>

            {/* Social Media */}
            <div className="flex gap-3 lg:gap-4">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="text-blue-200 hover:text-white transition-all p-2 lg:p-2.5 hover:bg-blue-800/50 rounded-xl hover:scale-110 hover:rotate-3 duration-300"
                  aria-label={label}
                >
                  <Icon size={20} className="lg:w-[22px] lg:h-[22px]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
