import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Newspaper } from 'lucide-react';
import careHubLogo from '../assets/images/carehub-logo.png';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/98 backdrop-blur-xl shadow-xl border-b border-gray-200/50'
      : 'bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100'
      }`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 flex-shrink-0 group">
            <img
              src={careHubLogo}
              alt="CareHub Logo"
              className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
            />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300">
              CareHub
            </span>
          </Link>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-blue-600 hover:text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer"
            >
              <Newspaper size={18} />
              Lihat Berita
            </button>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:via-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 duration-300"
            >
              <LogIn size={18} />
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
