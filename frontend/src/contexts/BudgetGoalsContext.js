import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/apiService';

const BudgetGoalsContext = createContext();

export function useBudgetGoals() {
  return useContext(BudgetGoalsContext);
}

export function BudgetGoalsProvider({ children }) {
  //ative goals within period 
  const [goals, setGoals] = useState([]);

  // all active goals without period
  const [activeGoals, setActiveGoals] = useState([]);

  // Set all goals (after fetching from backend)
  const setAllGoals = (newGoals) => setGoals(newGoals);

  // Update a single goal (after local update)
  const updateGoal = (updatedGoal) => {
    setGoals(goals =>
      goals.map(goal => goal._id === updatedGoal._id ? updatedGoal : goal)
    );
  };

  // Memoized fetchGoalsByPeriod to prevent infinite loop
  const fetchGoalsByPeriod = useCallback(async (period) => {
    try {
      const res = await apiService.get('/budget-goals', { params: { period } });
      setGoals(res.data.budgetGoals || []);
    } catch (error) {
      setGoals([]);
      // Optionally handle error here
    }
  }, []);

  // Fetch all active goals
  const fetchActiveGoals = useCallback(async () => {
    try {
      const res = await apiService.get('/budget-goals', { params: { status: 'active' } });
      setActiveGoals(res.data.budgetGoals || []);
    } catch (error) {
      setActiveGoals([]);
      // Optionally handle error here
    }
  }, []);

  // Refresh active goals (alias for fetchActiveGoals)
  const refreshActiveGoals = useCallback(() => {
    fetchActiveGoals();
  }, [fetchActiveGoals]);

  return (
    <BudgetGoalsContext.Provider value={{ goals, setAllGoals, updateGoal, fetchGoalsByPeriod, activeGoals, fetchActiveGoals, refreshActiveGoals }}>
      {children}
    </BudgetGoalsContext.Provider>
  );
} 