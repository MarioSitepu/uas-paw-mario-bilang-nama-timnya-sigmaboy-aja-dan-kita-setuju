import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface InsightArticle {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
  readTime: string;
}

export const InsightsSection: React.FC = () => {
  const articles: InsightArticle[] = [
    {
      id: 1,
      title: 'Don\'t Ignore Low Thyroid',
      excerpt: 'Understanding the symptoms and early detection of hypothyroidism for better health management',
      date: 'Dec 15, 2024',
      image: '🏥',
      category: 'Health Tips',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Heart Health Check-ups',
      excerpt: 'Regular cardiovascular screening is crucial for long-term wellness and disease prevention',
      date: 'Dec 10, 2024',
      image: '❤️',
      category: 'Wellness',
      readTime: '4 min read',
    },
    {
      id: 3,
      name: 'Mental Health Matters',
      excerpt: 'Breaking stigma and understanding the importance of mental health in overall wellbeing',
      date: 'Dec 8, 2024',
      image: '🧠',
      category: 'Wellness',
      readTime: '6 min read',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Insights for a Healthier Life
          </h2>
          <p className="text-lg text-gray-600">
            Stay informed with expert health tips, wellness guides, and medical insights
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-6xl">
                {article.image}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-600">{article.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title || article.name}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {article.date}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More
                    <ArrowRight size={16} />
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
