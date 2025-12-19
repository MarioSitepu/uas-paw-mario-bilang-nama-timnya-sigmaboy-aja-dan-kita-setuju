import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export const EmailSubscriptionSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Subscribing:', email);
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 lg:w-80 lg:h-80 bg-blue-700/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 lg:w-80 lg:h-80 bg-blue-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Mail className="w-6 h-6 lg:w-7 lg:h-7 text-blue-300" />
              <div className="text-xs sm:text-sm font-bold text-blue-300 tracking-widest uppercase">Newsletter</div>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 lg:mb-5 leading-tight tracking-tight">
              Tetap Terdepan dalam Perjalanan Kesehatan Anda
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed font-medium">
              Dapatkan wawasan ahli, panduan kesejahteraan, dan berita klinik — dikirim setiap bulan langsung ke inbox Anda.
            </p>
          </div>

          {/* Right Form */}
          <div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Email Anda"
                  className="w-full pl-10 lg:pl-12 pr-4 py-3.5 lg:py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-400/50 text-sm lg:text-base font-semibold shadow-xl border-2 border-transparent focus:border-blue-400 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group px-6 lg:px-8 py-3.5 lg:py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all whitespace-nowrap text-sm lg:text-base shadow-xl hover:shadow-2xl transform hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Berlangganan</span>
                    <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            <p className="text-blue-200 text-xs lg:text-sm mt-3 lg:mt-4 text-center sm:text-left">
              Kami menghormati privasi Anda. Unsubscribe kapan saja.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};
