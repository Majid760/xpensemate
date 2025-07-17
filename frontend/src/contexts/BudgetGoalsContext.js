import React, { createContext, useContext, useState } from 'react';

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

  return (
    <BudgetGoalsContext.Provider value={{ goals, setAllGoals, updateGoal }}>
      {children}
    </BudgetGoalsContext.Provider>
  );
} 