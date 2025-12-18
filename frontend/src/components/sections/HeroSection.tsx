import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-450 to-blue-500 pt-16 pb-0 lg:pt-20 lg:pb-0">
      <div className="container mx-auto px-4 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Content */}
          <div className="text-white flex flex-col justify-center pb-12 lg:pb-0">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                <span className="text-lg">👥</span>
                Join 10,000+ happy patients
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Your Trusted<br />Partner in Modern<br />Healthcare
            </h1>
            
            <p className="text-base text-blue-50 mb-8 leading-relaxed max-w-md">
              Experience comprehensive care, compassionate support, and cutting-edge expertise supporting your best health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12 w-fit">
              <Link
                to="/patient/doctors-list"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all hover:shadow-lg"
              >
                Explore Services
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold mb-1">50+</div>
                <p className="text-blue-100 text-xs">Healthcare Professionals</p>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">97%</div>
                <p className="text-blue-100 text-xs">Patient Satisfaction</p>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">10K+</div>
                <p className="text-blue-100 text-xs">Supporting Lives</p>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="relative h-96 lg:h-full lg:min-h-[500px] bg-gradient-to-bl from-blue-300 to-blue-400 rounded-3xl lg:rounded-none lg:rounded-tl-3xl flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="text-8xl mb-4">👨‍👩‍👧</div>
              <p className="text-blue-100 font-semibold text-sm">Healthcare Family</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
