import React, { useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import QuickAccess from '../components/QuickAccess';
import WeeklyStats from '../components/WeeklyStats';
import BudgetGoals from '../components/BudgetGoals';
import FoodAnalytics from '../components/FoodAnalytics';
import Analysis from '../components/Analysis';
import PaymentDialog from '../components/PaymentPopUp';
import ExpenseDialog from '../components/ExpensePopUp';
import BudgetGoalDialog from '../components/BudgetGoalPopUp';
import Toast from '../components/Toast';
import apiService from '../services/apiService';

const Dashboard = ({ expanded, setExpanded }) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(null);
  const [toast, setToast] = useState(null);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showBudgetGoalDialog, setShowBudgetGoalDialog] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [budgetGoalToEdit, setBudgetGoalToEdit] = useState(null);
  const weeklyStatsRef = useRef();

  const handleAddPayment = () => {
    setPaymentToEdit(null);
    setShowPaymentDialog(true);
  };

  const handlePaymentAction = async (paymentData) => {
    try {
      await apiService.post('/create-payment', paymentData, { withCredentials: true });
      setToast({ type: 'success', message: 'Payment added successfully!' });
      if (weeklyStatsRef.current && weeklyStatsRef.current.refresh) {
        weeklyStatsRef.current.refresh();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to add the payment!'
      });
    }
  };

  const handleAddExpense = () => {
    setExpenseToEdit(null);
    setShowExpenseDialog(true);
  };

  const handleAddBudgetGoal = () => {
    setBudgetGoalToEdit(null);
    setShowBudgetGoalDialog(true);
  };

  const handleExpenseAction = async (expenseData) => {
    try {
      // Ensure date is set to today if not provided
      let dataToSend = { ...expenseData };
      if (!dataToSend.date) {
        const today = new Date();
        dataToSend.date = today.toISOString().split('T')[0];
      }
      // Debug log
      await apiService.post('/create-expense', dataToSend, { withCredentials: true });
      setToast({ type: 'success', message: 'Expense added successfully!' });
      
      // Dispatch event to refresh budget goals
      window.dispatchEvent(new CustomEvent('expenseUpdated'));
      
      if (weeklyStatsRef.current && weeklyStatsRef.current.refresh) {
        weeklyStatsRef.current.refresh();
      }
    } catch (error) {
      console.log('error is ',error);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to add the expense!'
      });
    }
  };

  const handleBudgetGoalAction = async (goalData) => {
    try {
      await apiService.post('/create-budget-goal', goalData, { withCredentials: true });
      setToast({ type: 'success', message: 'Budget goal added successfully!' });
      
      // Dispatch event to refresh budget goals
      window.dispatchEvent(new CustomEvent('budgetGoalUpdated'));
      
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to add the budget goal!'
      });
    }
  };

  return (
    
    <div className="flex min-h-screen bg-gray-50 ">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-72' : 'ml-20'}`}
      >
        {/* Top Bar */}
        <TopBar />
        {/* Main Content Container - Consistent padding with QuickAccess */}
        <div className="max-w-8xl  px-4 sm:px-6 lg:px-8 py-0 space-y-6">
           {/* Quick Access Section */}
        <QuickAccess
          onAddPayment={handleAddPayment}
          onAddExpense={handleAddExpense}
          onAddBudgetGoal={handleAddBudgetGoal}
        />
          
          {/* Weekly Stats Section - Full Width with consistent padding */}
            <WeeklyStats ref={weeklyStatsRef} />
          
          {/* Budget Goals Section - Full Width with consistent padding */}
            <BudgetGoals />
          
          
          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food Analytics */}
              <FoodAnalytics />
            
            {/* Analysis */}
              <Analysis />
          </div>
          
        </div>
      </main>
      
      {/* Dialogs */}
      {showPaymentDialog && (
        <PaymentDialog
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={handlePaymentAction}
          paymentToEdit={paymentToEdit}
        />
      )}
      {showExpenseDialog && (
        <ExpenseDialog
          onClose={() => setShowExpenseDialog(false)}
          onSuccess={handleExpenseAction}
          expenseToEdit={expenseToEdit}
        />
      )}
      {showBudgetGoalDialog && (
        <BudgetGoalDialog
          onClose={() => setShowBudgetGoalDialog(false)}
          onSuccess={handleBudgetGoalAction}
          budgetGoalToEdit={budgetGoalToEdit}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;