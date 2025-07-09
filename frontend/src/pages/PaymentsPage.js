import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import PaymentsTable from '../components/PaymentsTable';


export default function PaymentsPage({ expanded, setExpanded }) {
  return (
    <div >
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-72' : 'ml-20'}`}
      >
        <TopBar/>
        <div className="w-full">
          <PaymentsTable />
        </div>
      </main>
    </div>
  );
} 