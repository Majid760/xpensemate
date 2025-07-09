import React from 'react';
import { FaBell } from 'react-icons/fa';
import SearchBar from './SearchBar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function TopBar({ showSearch = true }) {
  const { t } = useTranslation();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur-xl shadow-md rounded-2xl px-4 mx-8 sm:px-6 lg:px-8 py-3 sm:py-4 mb-4 transition-all duration-300 border border-slate-100">
      <div className="flex-1 min-w-0">
        {showSearch && <SearchBar />}
      </div>
      <button
        className="ml-3 flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all duration-200 shadow-sm border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label={t('topBar.notifications')}
        type="button"
      >
      
        <FaBell className="text-indigo-500 text-xl" />
      </button>
     
    </div>
  );
} 