import React from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { WhatWeOfferSection } from '../components/sections/WhatWeOfferSection';
import { TotalCareModelSection } from '../components/sections/TotalCareModelSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { InsightsSection } from '../components/sections/InsightsSection';
import { EmailSubscriptionSection } from '../components/sections/EmailSubscriptionSection';
import { Footer } from '../components/sections/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <section id="about">
        <AboutSection />
      </section>

      {/* What We Offer Section */}
      <section id="services">
        <WhatWeOfferSection />
      </section>

      {/* Total Care Model Section */}
      <TotalCareModelSection />

      {/* Testimonials Section */}
      <section id="testimonials">
        <TestimonialsSection />
      </section>

      {/* Insights/News Section */}
      <section id="news">
        <InsightsSection />
      </section>

      {/* Email Subscription Section */}
      <EmailSubscriptionSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

