import React, { useState } from 'react';
import { ArrowRight, Calendar, Clock, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface InsightArticle {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  readTime: string;
  category?: string;
}

export const InsightsSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState<InsightArticle | null>(null);

  const articles: InsightArticle[] = [
    {
      id: 1,
      title: '5 Kebiasaan Sehari-hari untuk Jantung yang Lebih Sehat yang Layak Anda Dapatkan.',
      excerpt: 'Temukan kebiasaan sehari-hari yang sederhana namun efektif yang dapat secara signifikan meningkatkan kesehatan kardiovaskular dan kesejahteraan Anda secara keseluruhan.',
      date: '25 Jan 2025',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      readTime: '5 min',
      category: 'Kesehatan Jantung',
    },
    {
      id: 2,
      title: 'Manfaat Utama Pemeriksaan Kesehatan Rutin.',
      excerpt: 'Pelajari mengapa pemeriksaan kesehatan rutin sangat penting untuk deteksi dini, pencegahan, dan mempertahankan kesehatan optimal sepanjang hidup Anda.',
      date: '20 Jan 2025',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
      readTime: '4 min',
      category: 'Pencegahan',
    },
    {
      id: 3,
      title: 'Hubungan Antara Stres & Kesehatan Fisik.',
      excerpt: 'Memahami bagaimana stres mempengaruhi kesehatan fisik Anda dan strategi praktis untuk mengelola stres demi kesejahteraan keseluruhan yang lebih baik.',
      date: '15 Jan 2025',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
      readTime: '6 min',
      category: 'Mental Health',
    },
  ];

  return (
    <>
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-0 w-48 h-48 lg:w-56 lg:h-56 bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-64 h-64 lg:w-72 lg:h-72 bg-blue-200/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-10 lg:mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 lg:w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
              <div className="text-xs sm:text-sm font-bold text-blue-600 tracking-widest uppercase">Berita & Artikel</div>
              <div className="w-10 lg:w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 lg:mb-5 leading-tight tracking-tight">
              Jelajahi Wawasan Ahli untuk Hidup yang Lebih Sehat dan Bahagia
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl lg:max-w-4xl mx-auto font-medium">
              Temukan wawasan kesehatan ahli, saran kesejahteraan, dan pembaruan medis untuk membantu Anda membuat keputusan yang tepat dan menjalani hidup yang lebih sehat setiap hari.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => (
              <motion.div
                key={article.id}
                layoutId={`article-${article.id}`}
                onClick={() => setSelectedArticle(article)}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 cursor-pointer"
                whileHover={{ y: -8 }}
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <motion.div
                    layoutId={`image-${article.id}`}
                    className="w-full h-48 sm:h-56 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${article.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.div>
                  {/* Category badge */}
                  <div className="absolute top-3 left-3 lg:top-4 lg:left-4 px-2.5 lg:px-3 py-1 lg:py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-blue-600 shadow-lg">
                    {article.category || 'Kesehatan'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <motion.h3
                    layoutId={`title-${article.id}`}
                    className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight"
                  >
                    {article.title}
                  </motion.h3>
                  <p className="text-gray-600 mb-5 lg:mb-6 line-clamp-2 leading-relaxed text-sm lg:text-base">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-5 lg:pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2.5 lg:gap-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Calendar size={12} />
                        {article.date}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Clock size={12} />
                        {article.readTime}
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 lg:gap-2 group-hover:gap-2.5 lg:group-hover:gap-3 transition-all text-xs lg:text-sm">
                      Baca Selengkapnya
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Detail Modal Overlay */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              layoutId={`article-${selectedArticle.id}`}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedArticle(null);
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>

              {/* Modal Image */}
              <motion.div
                layoutId={`image-${selectedArticle.id}`}
                className="w-full h-64 sm:h-72 bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url(${selectedArticle.image})` }}
              >
                {/* Simplified overlay just for visual depth, no text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3">
                    {selectedArticle.category || 'Kesehatan'}
                  </span>
                  <motion.h3
                    layoutId={`title-${selectedArticle.id}`}
                    className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900"
                  >
                    {selectedArticle.title}
                  </motion.h3>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    {selectedArticle.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    {selectedArticle.readTime} Baca
                  </span>
                </div>

                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                  {selectedArticle.excerpt}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(`/articles/${selectedArticle.id}`)}
                    className="flex-1 btn btn-primary py-3 md:py-4 text-base gap-2"
                  >
                    Baca Artikel Lengkap
                    <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
