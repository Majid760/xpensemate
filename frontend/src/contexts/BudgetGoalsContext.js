import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/apiService';

const BudgetGoalsContext = createContext();

export function useBudgetGoals() {
  return useContext(BudgetGoalsContext);
}

export function BudgetGoalsProvider({ children }) {
  const [goals, setGoals] = useState([]);

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

  return (
    <BudgetGoalsContext.Provider value={{ goals, setAllGoals, updateGoal, fetchGoalsByPeriod }}>
      {children}
    </BudgetGoalsContext.Provider>
  );
} 