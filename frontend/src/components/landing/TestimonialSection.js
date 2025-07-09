import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function TestimonialSection() {
  const { t } = useTranslation();
  const testimonials = t('testimonialsSection.testimonials', { returnObjects: true });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const getCardPosition = (index) => {
    const current = currentIndex;
    const total = testimonials.length;
    if (index === current) {
      return 'center';
    } else if (index === (current - 1 + total) % total) {
      return 'left';
    } else if (index === (current + 1) % total) {
      return 'right';
    } else {
      return 'hidden';
    }
  };

  const getCardStyles = (position) => {
    const baseStyles = 'absolute top-0 transition-all duration-700 ease-in-out';
    switch (position) {
      case 'center':
        return `${baseStyles} left-1/2 transform -translate-x-1/2 opacity-100 scale-100 z-30`;
      case 'left':
        return `${baseStyles} left-0 transform -translate-x-8 opacity-60 scale-90 z-20`;
      case 'right':
        return `${baseStyles} right-0 transform translate-x-8 opacity-60 scale-90 z-20`;
      default:
        return `${baseStyles} opacity-0 scale-75 z-10 pointer-events-none`;
    }
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-2 mb-4 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm tracking-wider">
            {t('testimonialsSection.badge')}
          </span>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t('testimonialsSection.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('testimonialsSection.description')}
          </p>
        </div>
        {/* Testimonial Cards Container */}
        <div className="relative h-96 mb-8 flex items-center justify-center">
          {testimonials.map((testimonial, index) => {
            const position = getCardPosition(index);
            return (
              <div
                key={`${testimonial.name}-${index}`}
                className={`w-80 ${getCardStyles(position)}`}
              >
                <div className="bg-white rounded-xl shadow-lg p-8  text-center min-h-100 flex flex-col justify-between">
                  {/* Stars */}
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.stars)].map((_, starIndex) => (
                      <svg
                        key={starIndex}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    ))}
                  </div>
                  {/* Quote */}
                  <blockquote className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow italic">
                    "{testimonial.quote}"
                  </blockquote>
                  {/* User Info */}
                  <div className="flex flex-col items-center">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mb-3 border-4 border-gray-100"
                    />
                    <h4 className="font-bold text-gray-800 text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 