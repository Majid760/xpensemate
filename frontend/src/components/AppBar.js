import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Privacy from '../pages/Privacy';

export default function AppBar() {
  const { t } = useTranslation();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg border-b border-slate-200/70' : 'bg-transparent'}`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo/Title left */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">X</span>
          </div>
          <span className="text-2xl font-bold text-indigo-900 tracking-tight">{t('appBar.brand')}</span>
        </div>
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-6 ml-auto">
          <ul className="flex items-center gap-2 xl:gap-6 font-semibold text-slate-700 text-base">
            <li><NavLink to="/" id="home" className={({ isActive }) => `px-3 py-2 font-bold ${isActive ? 'text-indigo-700' : ''}`}>{t('appBar.nav.home')}</NavLink></li>
            <li><NavLink to="/privacy" className={({ isActive }) => `px-3 py-2 hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-700' : ''}`}>{t('appBar.nav.privacy')}</NavLink></li>
            <li>
              <NavLink to="/terms&conditions" className={({ isActive }) => `px-3 py-2 hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-700' : ''}`}>{t('appBar.nav.terms')}</NavLink>
            </li>
            <li><NavLink to="/about" className={({ isActive }) => `px-3 py-2 hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-700' : ''}`}>{t('appBar.nav.about')}</NavLink></li>

          </ul>
          <button
            className="ml-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base transform hover:scale-105"
            onClick={() => navigate('/login')}
          >{t('appBar.getStarted')}</button>
        </div>
        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center ml-auto">
          <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Open menu" onClick={() => setShowMobileNav(true)}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        {/* Mobile Nav Drawer */}
        {showMobileNav && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setShowMobileNav(false)}>
            <div className="fixed right-0 top-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-xl p-6 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">X</span>
                  </div>
                  <span className="text-xl font-bold text-indigo-900 tracking-tight">{t('appBar.brand')}</span>
                </div>
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="flex flex-col gap-4 font-semibold text-slate-700 text-base">
                <li><NavLink to="/" className={({ isActive }) => `text-indigo-600 font-bold ${isActive ? 'text-indigo-700' : ''}`} onClick={() => setShowMobileNav(false)}>{t('appBar.nav.home')}</NavLink></li>
                <li><NavLink to="/about" className={({ isActive }) => `hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-700' : ''}`} onClick={() => setShowMobileNav(false)}>{t('appBar.nav.about')}</NavLink></li>
                <li><NavLink to="/privacy" className={({ isActive }) => `hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-700' : ''}`} onClick={() => setShowMobileNav(false)}>{t('appBar.nav.privacy')}</NavLink></li>
                <li><NavLink to="/terms&Condition" className={({ isActive }) => `hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-700' : ''}`} onClick={() => setShowMobileNav(false)}>{t('appBar.nav.terms')}</NavLink></li>
                <li><NavLink to="/contact" className={({ isActive }) => `hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-700' : ''}`} onClick={() => setShowMobileNav(false)}>{t('appBar.nav.contact')}</NavLink></li>
              </ul>
              <button className="mt-8 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200 text-base text-center"                 onClick={() => navigate('/login')}
              >{t('appBar.getStarted')}</button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}