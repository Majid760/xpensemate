import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import styles from './BudgetGoalsPage.module.css';
import BudgetGoalsTable from '../components/BudgetGoalsTable';


export default function BudgetGoalsPage({ expanded, setExpanded }) {
  return (
    <div className={styles.layout}>
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-72' : 'ml-20'}`}
        // style={{ marginLeft: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
      >
        <TopBar className="ml-0"/>
        <div className="w-full">
          <BudgetGoalsTable />
        </div>
      </main>
    </div>
  );
} 