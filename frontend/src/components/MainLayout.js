import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
  const [expanded, setExpanded] = useState(window.innerWidth > 768);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-72' : 'ml-20'}`}>
        <TopBar />
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet /> {/* This will render the specific page component */}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 