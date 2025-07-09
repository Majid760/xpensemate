import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppBar from '../components/AppBar';
import FeaturesSection from '../components/landing/FeaturesSection';
import AdvancedFeaturesSection from '../components/landing/AdvancedFeaturesSection';
import MobileAppsSection from '../components/landing/MobileAppsSection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import TestimonialSection from '../components/landing/TestimonialSection';
import NewsletterSection from '../components/landing/NewsletterSection';
import statsImg from '../images/stats.png';
import FooterGrid from '../components/landing/FooterGrid';

function HeroSection() {
  const navigate = useNavigate();
  return (
      <div className="relative overflow-hidden pt-20 min-h-screen flex items-center ">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl opacity-20 animate-pulse transform rotate-12"></div>
          <div className="absolute top-40 right-16 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute top-60 left-1/4 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 transform rotate-45 opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 right-1/4 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl opacity-20 animate-bounce delay-500"></div>
          <div className="absolute bottom-20 left-16 w-18 h-18 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-25 animate-pulse delay-2000"></div>
          
          {/* Floating orbs with custom animations */}
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-gradient-radial from-indigo-300/30 to-transparent rounded-full blur-sm animate-float"></div>
          <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-gradient-radial from-purple-300/20 to-transparent rounded-full blur-md animate-float-delayed"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-radial from-blue-300/25 to-transparent rounded-full blur-sm animate-float-slow"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" className="text-indigo-600" />
            </svg>
          </div>
          
          {/* Animated gradient overlays */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-indigo-200/40 to-transparent rounded-br-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-200/40 to-transparent rounded-tl-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        
        {/* Main Hero Section */}
        <main className="flex-1 flex flex-col md:flex-row items-center justify-center text-center md:text-left px-4 py-12 relative z-10 gap-0">
          {/* Left: Text and Buttons */}
          <motion.div 
            className="flex-1 flex flex-col justify-center items-center md:items-start md:ml-8"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="max-w-2xl mx-auto md:mx-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight leading-tight">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Finances
                </span>{' '}
                <br className="hidden sm:block" />
                with XpenseMate
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Effortlessly track expenses, set budgets, and achieve your financial goals with a beautiful, intuitive dashboard designed for modern life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-16">
              <button
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl text-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                onClick={() => navigate('/login')}
              >
                  Get Started Free
                </button>
                <button className="px-8 py-4 bg-white/80 backdrop-blur-sm border border-indigo-200 text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-white hover:shadow-xl text-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
                  Watch Demo
                </button>
              </div>
            </div>
          </motion.div>
          {/* Right: Stats Image */}
          <div className="flex-1 flex justify-center items-center md:-ml-8">
            <motion.img
              src={statsImg}
              alt="XpenseMate Stats UI"
              className="max-w-full h-auto object-contain drop-shadow-2xl"
              style={{ minWidth: '380px', maxWidth: '700px', transformOrigin: 'left center' }}
              initial={{ opacity: 0, scale: 1.2, y: 90 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -16, 0],
                x: [0, 50, 0, -50, 0],
                rotateY: [0, 20, 0, -20, 0],
              }}
              transition={{
                opacity: { duration: 1.2, ease: 'easeOut' },
                scale: { duration: 1.2, ease: 'easeOut' },
                y: {
                  duration: 4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                  delay: 1.2,
                },
                x: {
                  duration: 8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                  delay: 1.5,
                },
                rotateY: {
                  duration: 8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                  delay: 1.5,
                },
              }}
            />
          </div>
        </main>
      </div>
  );
}

function Footer() {
  return (
    <footer className="w-full text-center py-8 text-slate-500 text-sm mt-auto relative z-10 bg-white/30 backdrop-blur-sm border-t border-slate-200/50">
      <p>&copy; {new Date().getFullYear()} XpenseMate. All rights reserved.</p>
    </footer>
  );
}

export default function LandingPage() {

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <AppBar />
      <HeroSection />
      <FeaturesSection />
      <AdvancedFeaturesSection />
      <MobileAppsSection />
      <PricingSection />
      <FAQSection />
      <TestimonialSection />
      <NewsletterSection />

      <FooterGrid />
      <Footer />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}