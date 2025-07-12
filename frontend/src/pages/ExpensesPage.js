import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import styles from './ExpensesPage.module.css';
import ExpensesTable from '../components/ExpensesTable';
import ExpenseInsight from '../components/ExpensesInsights';

export default function ExpensesPage({ expanded, setExpanded }) {
  return (
    <div className={styles.layout}>
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-72' : 'ml-20'}`}
        // style={{ marginLeft: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
      >
        <TopBar/>
        {/* <ExpenseInsight/> */}
        
        <div className="w-full ">
          <ExpensesTable />
        </div>
      </main>
    </div>
  );
} 