import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Shield, Mail, Star } from 'lucide-react';
import AppBar from '../components/AppBar';
import FooterGrid from '../components/landing/FooterGrid';

function AboutSection({ icon: Icon, title, children, delay = 0, accent = 'indigo' }) {
  const accentColors = {
    indigo: 'from-indigo-600 to-purple-600',
    blue: 'from-blue-600 to-indigo-600',
    green: 'from-green-600 to-emerald-600',
    yellow: 'from-yellow-400 to-amber-500',
    pink: 'from-pink-500 to-purple-500',
  };
  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="flex items-center mb-6">
        <div className={`w-12 h-12 bg-gradient-to-r ${accentColors[accent]} rounded-xl flex items-center justify-center mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>
      <div className="text-slate-600 leading-relaxed space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl opacity-10 animate-pulse transform rotate-12"></div>
        <div className="absolute top-40 right-16 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute bottom-32 right-1/4 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl opacity-10 animate-bounce delay-500"></div>
        <div className="absolute bottom-20 left-16 w-18 h-18 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-15 animate-pulse delay-2000"></div>
      </div>

      <AppBar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center bg-white/40 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30">
              <Star className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-medium">About XpenseMate</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight">
              Empowering Your {' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Financial {' '}
              </span>
               Journey
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              XpenseMate is your trusted partner for smart expense tracking, budgeting, and financial insights. Our mission is to make personal finance simple, secure, and accessible for everyone.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="space-y-8">
          <AboutSection icon={TrendingUp} title="Our Mission" delay={0.1} accent="indigo">
            <p>
              At XpenseMate, we believe that everyone deserves financial clarity and control. Our mission is to empower individuals and families to make informed decisions, achieve their goals, and build a secure financial future.
            </p>
          </AboutSection>

          <AboutSection icon={Shield} title="Key Features" delay={0.2} accent="blue">
            <ul className="list-disc pl-6 space-y-2">
              <li>Intuitive expense tracking and categorization</li>
              <li>Customizable budget goals and spending limits</li>
              <li>AI-powered insights and analytics</li>
              <li>Bank-grade security and privacy</li>
              <li>Multi-device sync and cloud backup</li>
              <li>Personalized notifications and reminders</li>
              <li>Seamless import/export of financial data</li>
            </ul>
          </AboutSection>

          {/* <AboutSection icon={Users} title="Meet the Team" delay={0.3} accent="green">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Majid Rahimi</h3>
                <p className="text-sm">Founder & Lead Developer. Passionate about fintech, privacy, and building tools that make a difference.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Sara Ahmadi</h3>
                <p className="text-sm">Product Designer. Focused on user experience, accessibility, and beautiful interfaces.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Ali Hosseini</h3>
                <p className="text-sm">Backend Engineer. Ensures data security, reliability, and seamless integrations.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Fatemeh Karimi</h3>
                <p className="text-sm">Customer Success. Dedicated to helping users get the most out of XpenseMate.</p>
              </div>
            </div>
          </AboutSection> */}

          <AboutSection icon={Mail} title="Contact Us" delay={0.4} accent="pink">
            <div className="text-center">
              <p className="mb-4">Have questions, feedback, or partnership ideas? We'd love to hear from you!</p>
              <div className="inline-flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <Mail className="w-8 h-8 text-indigo-600 mr-4" />
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Contact</p>
                  <a href={`mailto:${process.env.REACT_APP_INFO_EMAIL}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    {process.env.REACT_APP_INFO_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </AboutSection>
        </div>
        {/* Last Updated */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 font-medium">
            Last updated: June 2024
          </p>
        </div>
      </div>

      <FooterGrid />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 