import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, AlertTriangle, Users, CreditCard, Shield, Clock, Gavel, CheckCircle, XCircle } from 'lucide-react';
import AppBar from '../components/AppBar';
import FooterGrid from '../components/landing/FooterGrid';



function TermsSection({ icon: Icon, title, children, delay = 0, accent = "indigo" }) {
  const accentColors = {
    indigo: "from-indigo-600 to-purple-600",
    blue: "from-blue-600 to-indigo-600",
    green: "from-green-600 to-emerald-600",
    red: "from-red-600 to-pink-600",
    amber: "from-amber-600 to-orange-600",
    purple: "from-purple-600 to-pink-600"
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

export default function TermsConditions() {
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
              <Scale className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-medium">Legal Agreement</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight">
              Terms{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                & Conditions
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using XpenseMate. 
              By using our service, you agree to be bound by these terms and conditions.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="space-y-8">
          
          <TermsSection icon={FileText} title="Agreement Overview" delay={0.1}>
            <p>
              These Terms and Conditions ("Terms") govern your use of XpenseMate ("Service"), 
              a personal finance management application that helps you track expenses, set budgeting goals, 
              and gain insights into your spending patterns.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-indigo-400">
              <p className="font-medium text-slate-800 mb-2">By using XpenseMate, you acknowledge that you have:</p>
              <ul className="text-sm space-y-1">
                <li>• Read and understood these Terms</li>
                <li>• Agreed to comply with all applicable laws</li>
                <li>• Confirmed you are at least 18 years old</li>
                <li>• Accepted responsibility for your account security</li>
              </ul>
            </div>
          </TermsSection>

          <TermsSection icon={Users} title="User Accounts & Responsibilities" delay={0.2} accent="blue">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Account Creation
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Provide accurate and complete information</li>
                  <li>• Maintain the security of your login credentials</li>
                  <li>• Notify us immediately of unauthorized access</li>
                  <li>• Keep your contact information up to date</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  Prohibited Activities
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Share accounts with unauthorized users</li>
                  <li>• Use the service for illegal activities</li>
                  <li>• Attempt to hack or reverse engineer</li>
                  <li>• Create multiple accounts to abuse features</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400">
              <p className="text-sm font-medium text-amber-800">
                <strong>Age Requirement:</strong> You must be at least 18 years old to use XpenseMate. 
                By creating an account, you confirm that you meet this age requirement.
              </p>
            </div>
          </TermsSection>

          <TermsSection icon={CreditCard} title="Service Features & Usage" delay={0.3} accent="green">
            <p className="mb-4">
              XpenseMate provides the following core features to help you manage your personal finances:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-2">Expense Tracking</h4>
                <p className="text-sm text-slate-600">Record, categorize, and monitor your daily expenses and income</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-2">Budget Goals</h4>
                <p className="text-sm text-slate-600">Set spending limits and track progress toward your financial objectives</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-2">Financial Insights</h4>
                <p className="text-sm text-slate-600">AI-powered analysis and personalized recommendations for better money management</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
              <h4 className="font-semibold text-slate-800 mb-2">Service Availability</h4>
              <p className="text-sm">
                While we strive for 99.9% uptime, XpenseMate may occasionally be unavailable due to maintenance, 
                updates, or unforeseen technical issues. We will provide advance notice when possible.
              </p>
            </div>
          </TermsSection>

          <TermsSection icon={Shield} title="Data & Privacy" delay={0.4} accent="purple">
            <p className="mb-4">
              Your financial data is sensitive, and we take its protection seriously. Here's what you need to know:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Your Data Rights</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You own all financial data you input into XpenseMate</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You can export your data at any time</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You can delete your account and data permanently</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Our Commitments</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>We never sell your personal or financial information</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>All data is encrypted and securely stored</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>We comply with all applicable privacy laws</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-700">
                For detailed information about how we collect, use, and protect your data, 
                please review our <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</a>.
              </p>
            </div>
          </TermsSection>

          <TermsSection icon={CreditCard} title="Subscription & Billing" delay={0.5} accent="amber">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Free Tier</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Basic expense tracking</li>
                  <li>• Simple budget goals</li>
                  <li>• Limited data history (6 months)</li>
                  <li>• Basic insights and reports</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Premium Features</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited expense tracking</li>
                  <li>• Advanced budgeting tools</li>
                  <li>• Complete data history</li>
                  <li>• AI-powered insights and chat</li>
                  <li>• Export capabilities</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400">
                <h4 className="font-semibold text-amber-800 mb-2">Billing Terms</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Subscriptions are billed monthly or annually in advance</li>
                  <li>• All charges are non-refundable unless required by law</li>
                  <li>• You can cancel your subscription at any time</li>
                  <li>• Price changes will be communicated 30 days in advance</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-400">
                <h4 className="font-semibold text-red-800 mb-2">Cancellation & Refunds</h4>
                <p className="text-sm text-red-700">
                  You may cancel your subscription at any time through your account settings. 
                  Cancellation takes effect at the end of your current billing period. 
                  No partial refunds are provided for unused portions of subscription periods.
                </p>
              </div>
            </div>
          </TermsSection>

          <TermsSection icon={AlertTriangle} title="Disclaimers & Limitations" delay={0.6} accent="red">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Financial Advice Disclaimer
                </h3>
                <p className="text-sm text-red-700">
                  XpenseMate is a financial tracking tool, not a financial advisor. 
                  Our insights and suggestions are for informational purposes only and should not be considered 
                  professional financial advice. Always consult with qualified financial professionals for investment decisions.
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">Service Limitations</h3>
                <p className="text-sm text-amber-700 mb-2">
                  While we strive for accuracy, XpenseMate is provided "as is" without warranties of any kind. We are not liable for:
                </p>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Errors in calculations or data processing</li>
                  <li>• Service interruptions or data loss</li>
                  <li>• Financial decisions made based on our insights</li>
                  <li>• Third-party integrations or services</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">Liability Limitation</h3>
                <p className="text-sm text-slate-700">
                  Our total liability to you for any claims related to XpenseMate shall not exceed 
                  the amount you paid for the service in the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </TermsSection>

          <TermsSection icon={Gavel} title="Legal Terms" delay={0.7}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Governing Law</h3>
                <p className="text-sm mb-3">
                  These Terms are governed by the laws of [Your Jurisdiction], 
                  without regard to conflict of law principles.
                </p>
                <h3 className="font-semibold text-slate-800 mb-3">Dispute Resolution</h3>
                <p className="text-sm">
                  Any disputes will be resolved through binding arbitration in accordance with 
                  the rules of [Arbitration Organization].
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Changes to Terms</h3>
                <p className="text-sm mb-3">
                  We may update these Terms periodically. We'll notify you of significant changes 
                  via email or in-app notification at least 30 days before they take effect.
                </p>
                <h3 className="font-semibold text-slate-800 mb-3">Severability</h3>
                <p className="text-sm">
                  If any provision of these Terms is found unenforceable, 
                  the remaining provisions will continue in full force.
                </p>
              </div>
            </div>
          </TermsSection>

          <TermsSection icon={Clock} title="Contact & Support" delay={0.8} accent="blue">
            <div className="text-center">
              <p className="mb-6">
                Have questions about these Terms? Need help with your account? We're here to assist you.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <FileText className="w-6 h-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Legal Questions</p>
                    <a href={`mailto:${process.env.REACT_APP_LEGAL_EMAIL}`}  className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    {process.env.REACT_APP_LEGAL_EMAIL}
                    </a>
                  </div>
                </div>
                <div className="inline-flex items-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <Users className="w-6 h-6 text-green-600 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Customer Support</p>
                    <a href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`}  className="text-green-600 hover:text-green-700 font-medium text-sm">
                      {process.env.REACT_APP_SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                We aim to respond to all inquiries within 24-48 hours
              </p>
            </div>
          </TermsSection>

        </div>

        {/* Last Updated */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 font-medium">
            Last updated: December 2024 • Effective Date: January 1, 2025
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