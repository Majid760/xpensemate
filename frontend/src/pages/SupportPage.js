import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import SupportContent from '../components/SupportContent';


export default function SupportPage({ expanded, setExpanded }) {
  return (
    <div className="flex w-full">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-72' : 'ml-20'}`}
      >
        <TopBar showSearch={false} />
        {/* The Support heading is part of the SupportContent based on the image */}
        <SupportContent />
      </main>
    </div>
  );
} 