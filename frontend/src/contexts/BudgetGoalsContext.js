import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/apiService';

const BudgetGoalsContext = createContext();

export function BudgetGoalsProvider({ children }) {
  const [activeGoals, setActiveGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch active budget goals from /dashboard/goals
   * @param {Object} params - Optional query params (e.g., { status, period })
   */
  const fetchActiveGoals = useCallback(async (params = { status: 'active', period: 'monthly' }) => {
    setLoading(true);
    try {
      const res = await apiService.get('/dashboard/goals', { params });
      setActiveGoals(res.data.goals || []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose a refresh function for convenience
  const refreshActiveGoals = (params = { status: 'active', period: 'monthly' }) => {
    fetchActiveGoals(params);
  };

  return (
    <BudgetGoalsContext.Provider value={{ activeGoals, loading, fetchActiveGoals, refreshActiveGoals }}>
      {children}
    </BudgetGoalsContext.Provider>
  );
}

export function useBudgetGoals() {
  return useContext(BudgetGoalsContext);
} 