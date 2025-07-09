import React, { useState, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const SearchBar = () => {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const { t } = useTranslation();

  return (
    <div className="flex items-center bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-sm px-3 py-1 w-full max-w-md min-w-0 h-11 transition-all duration-200 focus-within:border-indigo-400">
      <FaSearch className="text-indigo-400 text-lg mr-2" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={t('searchBar.placeholder')}
        className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-slate-700 placeholder-slate-400 font-medium px-0 py-0 focus:ring-0"
        style={{ minWidth: 0 }}
      />
      {value && (
        <button
          type="button"
          aria-label={t('searchBar.clear')}
          onClick={() => {
            setValue('');
            inputRef.current?.focus();
          }}
          className="ml-1 text-slate-400 hover:text-red-500 rounded-full p-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <IoMdClose className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

// Add a wrapper for the search bar section
export function SearchBarSection() {
  return null; // No longer used, kept for backward compatibility
} 