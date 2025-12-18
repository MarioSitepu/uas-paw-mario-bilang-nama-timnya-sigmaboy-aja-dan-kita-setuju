import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';

export const PublicDoctorsList: React.FC = () => {
  const navigate = useNavigate();

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      photo: '👩‍⚕️',
      rating: 4.8,
      reviews: 156,
      clinic: 'Heart Care Clinic',
      bio: 'Specialist in cardiovascular diseases with 10+ years experience',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'General Practitioner',
      photo: '👨‍⚕️',
      rating: 4.9,
      reviews: 234,
      clinic: 'City Health Center',
      bio: 'Comprehensive healthcare provider for the whole family',
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialization: 'Pediatrician',
      photo: '👩‍⚕️',
      rating: 4.7,
      reviews: 189,
      clinic: 'Children\'s Medical',
      bio: 'Dedicated to the health and wellness of children',
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialization: 'Orthopedic',
      photo: '👨‍⚕️',
      rating: 4.8,
      reviews: 167,
      clinic: 'Bone & Joint Center',
      bio: 'Expert in bone, joint, and muscle disorders',
    },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Find Your Doctor
          </h1>
          <p className="text-xl text-gray-600">
            Browse our network of qualified healthcare professionals and book an appointment
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 p-6 bg-gray-50 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or specialization..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Specializations</option>
              <option>Cardiologist</option>
              <option>General Practitioner</option>
              <option>Pediatrician</option>
              <option>Orthopedic</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Ratings</option>
              <option>4.5+ Stars</option>
              <option>4.0+ Stars</option>
              <option>3.5+ Stars</option>
            </select>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-6xl">
                {doctor.photo}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{doctor.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialization}</p>
                <p className="text-sm text-gray-600 mb-4">{doctor.clinic}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(doctor.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {doctor.rating} ({doctor.reviews})
                  </span>
                </div>

                {/* Action */}
                <Link
                  to="/auth/register"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Book an Appointment?</h2>
          <p className="mb-6 text-blue-50">
            Create an account to access all features and book your appointment securely
          </p>
          <Link
            to="/auth/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
};
