import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { ValuesSection } from '../components/sections/ValuesSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { InsightsSection } from '../components/sections/InsightsSection';
import { CTASection } from '../components/sections/CTASection';
import { Footer } from '../components/sections/Footer';
import { PublicLayout } from '../components/layout/PublicLayout';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Values Section */}
      <ValuesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Insights Section */}
      <InsightsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

