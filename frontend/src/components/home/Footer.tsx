import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-lg text-white">MedixWeb</span>
            </div>
            <p className="text-sm">
              Your trusted partner in modern healthcare. Quality medical services at your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-teal-300 transition">Home</Link></li>
              <li><a href="#services" className="hover:text-teal-300 transition">Services</a></li>
              <li><a href="#testimonials" className="hover:text-teal-300 transition">Testimonials</a></li>
              <li><a href="#contact" className="hover:text-teal-300 transition">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-300 transition">Doctor Consultation</a></li>
              <li><a href="#" className="hover:text-teal-300 transition">Medical Records</a></li>
              <li><a href="#" className="hover:text-teal-300 transition">Health Tracking</a></li>
              <li><a href="#" className="hover:text-teal-300 transition">Appointment Booking</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 support@medixweb.com</li>
              <li>📞 1-800-MEDIX-WEB</li>
              <li>📍 123 Healthcare Ave, Medical City</li>
              <li className="pt-2">Mon - Fri, 9AM - 6PM</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2025 MedixWeb. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
