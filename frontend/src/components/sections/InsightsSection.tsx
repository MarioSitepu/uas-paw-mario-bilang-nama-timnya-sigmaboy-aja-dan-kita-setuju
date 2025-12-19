import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

interface InsightArticle {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  readTime: string;
}

export const InsightsSection: React.FC = () => {
  const articles: InsightArticle[] = [
    {
      id: 1,
      title: '5 Kebiasaan Sehari-hari untuk Jantung yang Lebih Sehat yang Layak Anda Dapatkan.',
      excerpt: 'Temukan kebiasaan sehari-hari yang sederhana namun efektif yang dapat secara signifikan meningkatkan kesehatan kardiovaskular dan kesejahteraan Anda secara keseluruhan.',
      date: '25 Jan 2025',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      readTime: '5 min',
    },
    {
      id: 2,
      title: 'Manfaat Utama Pemeriksaan Kesehatan Rutin.',
      excerpt: 'Pelajari mengapa pemeriksaan kesehatan rutin sangat penting untuk deteksi dini, pencegahan, dan mempertahankan kesehatan optimal sepanjang hidup Anda.',
      date: '20 Jan 2025',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
      readTime: '4 min',
    },
    {
      id: 3,
      title: 'Hubungan Antara Stres & Kesehatan Fisik.',
      excerpt: 'Memahami bagaimana stres mempengaruhi kesehatan fisik Anda dan strategi praktis untuk mengelola stres demi kesejahteraan keseluruhan yang lebih baik.',
      date: '15 Jan 2025',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
      readTime: '6 min',
    },
  ];

  return (
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
            <div
              key={article.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <div 
                  className="w-full h-48 sm:h-56 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url(${article.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {/* Category badge */}
                <div className="absolute top-3 left-3 lg:top-4 lg:left-4 px-2.5 lg:px-3 py-1 lg:py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-blue-600 shadow-lg">
                  Kesehatan
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h3>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
