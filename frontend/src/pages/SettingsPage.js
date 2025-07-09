import React from 'react';
import Sidebar from '../components/Sidebar';
import SettingsContents from '../components/SettingContents';



export default function SettingsPage({ expanded, setExpanded }) {
  return (
    <div className="flex w-full">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-72' : 'ml-20'}`}
      >
        <SettingsContents />
      </main>
    </div>
  );
} 