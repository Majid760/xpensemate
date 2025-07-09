import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import styles from './Expenses.module.css';

const expenses = [
  { date: '2024-03-15', category: 'Food & Dining', amount: 45.50, description: 'Grocery shopping' },
  { date: '2024-03-14', category: 'Transportation', amount: 25.00, description: 'Taxi ride' },
  { date: '2024-03-13', category: 'Entertainment', amount: 30.00, description: 'Movie tickets' },
  { date: '2024-03-12', category: 'Shopping', amount: 89.99, description: 'New clothes' },
  { date: '2024-03-11', category: 'Utilities', amount: 120.00, description: 'Electricity bill' },
];

const columns = [
  {
    name: 'Date',
    selector: row => row.date,
    cell: row => <span style={{ paddingLeft: '6px' }}>{row.date}</span>,
    sortable: true,
    $grow: 1,
  },
  {
    name: 'Category',
    selector: row => row.category,
    cell: row => <span style={{ paddingLeft: '6px' }}>{row.category}</span>,
    sortable: true,
    $grow: 1,
  },
  {
    name: 'Description',
    selector: row => row.description,
    cell: row => <span style={{ paddingLeft: '6px' }}>{row.description}</span>,
    sortable: true,
    $grow: 2,
  },
  {
    name: 'Amount',
    selector: row => row.amount,
    cell: row => <span className={styles['amount']}>${row.amount.toFixed(2)}</span>,
    sortable: true,
    right: true,
    $grow: 1,
  },
  {
    name: '',
    cell: () => (
      <button className={styles['edit-btn']}>Edit</button>
    ),
    ignoreRowClick: true,
    $button: true,
    $grow: 1,
    style: { justifyContent: 'center' },
  },
];

const customStyles = {
  table: {
    style: {
      background: 'transparent',
    },
  },
  headRow: {
    style: {
      borderBottom: '1.5px solid #ccc',
      minHeight: '40px',
      background: 'transparent',
      marginTop: '-10px',
    },
  },
  headCells: {
    style: {
      color: '#767676',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '12px',
      lineHeight: '12px',
      fontWeight: 500,
      background: 'transparent',
      border: 'none',
      padding: '10px 3px',
      marginTop: '-10px',
    },
  },
  rows: {
    style: {
      background: '#ededed !important',
      borderRadius: '12px',
      marginBottom: '10px',
      minHeight: '36px',
      marginLeft: '0',
      marginRight: '0',
      display: 'flex',
      alignItems: 'center',
      '&:not(:last-child)': {
        marginBottom: '10px',
      },
      '&:first-child': {
        marginTop: '10px',
      },
    },
  },
  cells: {
    style: {
      border: 'none',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      background: 'transparent !important',
      padding: '6px 3px',
      display: 'flex',
      alignItems: 'left',
    },
  },
};

export default function Expenses() {
  const [ setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

 

  return (
    <div className={`dashboard-card ${styles['expenses-card']}`}>
      <div style={{ overflow: 'visible' }}>
        <div className={styles['expenses-title']}>Recent Expenses</div>
        <hr className={styles['expenses-divider']} />
        <DataTable
          columns={columns}
          data={expenses}
          customStyles={customStyles}
          noHeader={false}
          responsive
          highlightOnHover={false}
          pointerOnHover={false}
        />
      </div>
    </div>
  );
} 