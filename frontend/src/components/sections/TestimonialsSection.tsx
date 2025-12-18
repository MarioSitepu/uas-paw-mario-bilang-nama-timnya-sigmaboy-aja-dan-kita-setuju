import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

export const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Senior Cardiologist',
      image: '👩‍⚕️',
      content: 'Outstanding experience using MedixWeb. The platform has made managing patient appointments seamless and efficient.',
      rating: 5,
    },
    {
      id: 2,
      name: 'John Smith',
      role: 'Patient',
      image: '👨',
      content: 'Finally, a healthcare platform that puts the patient first. Booking appointments is incredibly easy!',
      rating: 5,
    },
    {
      id: 3,
      name: 'Dr. Emily Chen',
      role: 'General Practitioner',
      image: '👩‍⚕️',
      content: 'The secure data management and patient records system is exactly what we needed in our clinic.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Real Stories, Real Healing — From Our Community
          </h2>
          <p className="text-lg text-gray-600">
            Discover how patients and healthcare professionals are transforming their experience with MedixWeb
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{testimonial.image}</div>
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 leading-relaxed">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
