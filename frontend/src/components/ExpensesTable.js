import React, { useState, useEffect, useCallback } from 'react';
import { MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight, Edit, DollarSign, Banknote, CreditCard, Wallet } from 'lucide-react';
import ExpenseDialog from './ExpensePopUp';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import apiService from '../services/apiService';
import { useBudgetGoals } from '../contexts/BudgetGoalsContext';
import BudgetGoalsExpensesModal from './BudgetGoalsExpenses';
import ExpensesInsights from './ExpensesInsights';

const paymentIcons = {
  cash: Banknote,
  creditCard: CreditCard,
  debitCard: CreditCard, // or use a custom icon if you have one
  bankTransfer: Wallet,
  other: Wallet,
};

function PaymentIcon({ method }) {
  const Icon = paymentIcons[method] || Banknote;
  return <Icon className="w-5 h-5" />;
}

// Utility to capitalize payment method types (handles snake_case and camelCase)
function capitalizeWords(str) {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters (for camelCase)
    .replace(/_/g, ' ')         // Replace underscores with spaces
    .replace(/\s+/g, ' ')       // Remove extra spaces
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word
}

const ExpensesTable = () => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [toast, setToast] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [pageCache, setPageCache] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'single' or 'multiple'
  const [deleteId, setDeleteId] = useState(null);
  const { activeGoals, fetchGoalsByPeriod } = useBudgetGoals();
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [selectedBudgetGoal, setSelectedBudgetGoal] = useState(null);

  // Calculate pagination
  const totalPages = Math.ceil(totalRows / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchExpenses = useCallback(async (page, limit) => {
    if (pageCache[page]) {
      setExpenses(pageCache[page].expenses);
      setTotalRows(pageCache[page].total);
      setCurrentPage(pageCache[page].page);
      setPerPage(limit);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.get(`/expenses?page=${page}&limit=${limit}`, {
        withCredentials: true
      });
      const fetchedExpenses = response.data.expenses;
      const fetchedTotal = response.data.total;
      const fetchedPage = response.data.page;

      setPageCache(prevCache => ({
        ...prevCache,
        [fetchedPage]: { expenses: fetchedExpenses, total: fetchedTotal, page: fetchedPage }
      }));

      setExpenses(fetchedExpenses);
      setTotalRows(fetchedTotal);
      setCurrentPage(fetchedPage);
      setPerPage(limit);
    } catch (error) {
      console.error("Error fetching expenses:", error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to fetch expenses.'
      });
    } finally {
      setLoading(false);
    }
  }, [pageCache]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchExpenses(currentPage, perPage);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, currentPage, perPage, fetchExpenses]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchExpenses(newPage, perPage);
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === expenses.length && expenses.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(expenses.map(expense => expense._id || expense.id)));
    }
  };

  // delete the chunks of records
  const handleDelete = async () => {
    if (selectedRows.size > 0) {
      // Store original state for potential rollback
      const originalExpenses = [...expenses];
      const originalTotal = totalRows;

      // Optimistically remove selected items from local state
      setExpenses(prev => prev.filter(expense => !selectedRows.has(expense._id || expense.id)));
      setTotalRows(prev => Math.max(0, prev - selectedRows.size));
      setSelectedRows(new Set());

      try {
        // Attempt to delete on backend
        await Promise.all(Array.from(selectedRows).map(id =>
          apiService.delete(`/expense/${id}`, { withCredentials: true })
        ));
        setToast({
          type: 'success',
          message: 'Selected expenses deleted successfully!'
        });
      } catch (error) {
        // Revert local state on error
        setExpenses(originalExpenses);
        setTotalRows(originalTotal);
        console.error("Error deleting selected expenses:", error.response?.data || error.message);
        setToast({
          type: 'error',
          message: error.response?.data?.error || 'Failed to delete selected expenses.'
        });
      }
    }
  };

  // delete the single record 
  const handleRowDelete = async (id) => {
    setOpenMenuId(null); // Close menu
    // Store original state for potential rollback
    const originalExpenses = [...expenses];
    const originalTotal = totalRows;
    // Optimistically remove the item from local state
    setExpenses(prev => prev.filter(expense => (expense._id || expense.id) !== id));
    setTotalRows(prev => Math.max(0, prev - 1));
    try {
      // Attempt to delete on backend
      await apiService.delete(`/expense/${id}`, { withCredentials: true });

      setToast({
        type: 'success',
        message: 'Expense deleted successfully!'
      });
    } catch (error) {
      // Revert local state on error
      setExpenses(originalExpenses);
      setTotalRows(originalTotal);
      console.error("Error deleting expense:", error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to delete expense.'
      });
    }
  };

  // handle the edit of single record
  const handleEdit = (id) => {
    setOpenMenuId(null);
    const expense = expenses.find(exp => (exp._id || exp.id) === id);
    if (expense) {
      setExpenseToEdit(expense);
      setShowExpenseDialog(true);
    }
  };

  const handleAddNew = () => {
    setExpenseToEdit(null);
    setShowExpenseDialog(true);
  };

  const handleExpenseAction = async (expenseData, isEditMode) => {
    setLoading(false);
    try {
      const backendData = {
        name: expenseData.name,
        amount: parseFloat(expenseData.amount),
        date: expenseData.date,
        category_id: expenseData.category_id,
        category: expenseData.category,
        detail: expenseData.detail,
        time: expenseData.time,
        location: expenseData.location,
        payment_method: expenseData.payment_method || 'cash',
        budget_goal_id: expenseData.budget_goal_id,
      };

      if (isEditMode && expenseData._id) {
        // Store the original expense for potential rollback
        const originalExpense = expenses.find(exp => exp._id === expenseData._id);

        // Optimistically update local state
        const updatedExpense = {
          ...expenseData,
          category: expenseData.category
        };

        setExpenses(prev => prev.map(exp =>
          exp._id === expenseData._id ? updatedExpense : exp
        ));

        try {
          // Update backend without affecting local state
          await apiService.put(`/expense/${expenseData._id}`, backendData, { withCredentials: true });
          setToast({
            type: 'success',
            message: 'Expense updated successfully!'
          });

          // Dispatch event to refresh budget goals
          window.dispatchEvent(new CustomEvent('expenseUpdated'));
        } catch (error) {
          // Revert local state on error
          setExpenses(prev => prev.map(exp =>
            exp._id === expenseData._id ? originalExpense : exp
          ));
          throw error;
        }
      } else {
        // Create new expense
        const tempExpense = {
          ...expenseData,
          _id: Date.now().toString(),
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Optimistically add to local state
        setExpenses(prev => [tempExpense, ...prev.filter(exp => exp.id !== tempExpense.id)]);
        setTotalRows(prev => prev + 1);
        setCurrentPage(1);

        try {
          const response = await apiService.post('/create-expense', backendData, { withCredentials: true });

          // Update temporary entry with real data
          setExpenses(prev => prev.map(exp =>
            exp._id === tempExpense._id
              ? { ...response.data, id: response.data._id, category: response.data.category_id ? response.data.category_id.name : response.data.category }
              : exp
          ));
          setToast({
            type: 'success',
            message: 'Expense added successfully!'
          });

          // Dispatch event to refresh budget goals
          window.dispatchEvent(new CustomEvent('expenseUpdated'));
        } catch (error) {
          // Remove temporary entry on error
          setExpenses(prev => prev.filter(exp => exp._id !== tempExpense._id));
          setTotalRows(prev => Math.max(0, prev - 1));
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} expense:`, error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'add'} the expense!`
      });
    } finally {
      setLoading(false);
      setShowExpenseDialog(false);
      setExpenseToEdit(null);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 'Invalid Amount';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };

    // Add event listener to window
    window.addEventListener('click', handleClickOutside);

    // Cleanup
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  const handleDeleteClick = (id = null) => {
    if (id) {
      setDeleteType('single');
      setDeleteId(id);
    } else {
      setDeleteType('multiple');
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === 'single') {
        await handleRowDelete(deleteId);
      } else {
        await handleDelete();
      }
      setToast({
        type: 'success',
        message: `Expense${deleteType === 'multiple' ? 's' : ''} deleted successfully`
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: `Failed to delete expense${deleteType === 'multiple' ? 's' : ''}`
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteType(null);
      setDeleteId(null);
    }
  };

  useEffect(() => { fetchGoalsByPeriod(); }, [fetchGoalsByPeriod]);

  return (
    <div className="w-full font-sans  sm:px-6 lg:px-8">

      {/* Card Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 overflow-hidden mx-auto max-w-full transition-all duration-300 border-t-0">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />

        <ExpensesInsights onAddExpense={handleAddNew} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-8 pt-6 pb-4">
          <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            <DollarSign className="text-indigo-500" size={28} />
            Expenses
          </h2>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <button
                onClick={() => handleDeleteClick()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-all duration-200 active:scale-95 text-sm"
              >
                <Trash2 size={16} />
                Delete ({selectedRows.size})
              </button>
            )}
            {/* Remove Add Expense button here */}
          </div>
        </div>

        {/* Table Container */}

{/* Cards Container */}
<div className="px-4 sm:px-8 pb-6">
  {loading ? (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="text-lg font-medium text-slate-600">Loading expenses...</span>
      </div>
    </div>
  ) : expenses.length === 0 ? (
    <div className="text-center py-16">
      <div className="text-slate-300 mb-6">
        <DollarSign size={64} className="mx-auto" />
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-3">No expenses yet</h3>
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        Start tracking your expenses to better manage your budget and reach your financial goals.
      </p>
      <button 
        onClick={handleAddNew} 
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Add Your First Expense
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {expenses.map((expense, index) => {
        const isSelected = selectedRows.has(expense._id || expense.id);
        const expenseDate = new Date(expense.date);
        const isRecent = (new Date() - expenseDate) / (1000 * 60 * 60 * 24) <= 7; // Within 7 days
        const amountColor =
          expense.amount > 1000
            ? 'text-red-500'
            : expense.amount > 500
            ? 'text-amber-500'
            : 'text-emerald-600';
        const dotColor =
          expense.amount > 1000
            ? 'bg-red-500'
            : expense.amount > 500
            ? 'bg-amber-500'
            : 'bg-emerald-500';
        return (
          <div
            key={expense._id || expense.id}
            className={`relative bg-white border border-slate-200 rounded-xl p-5 transition-all duration-200 group cursor-pointer overflow-hidden animate-[fadeIn_0.4s] ${
              isSelected ? 'ring-2 ring-indigo-400 border-indigo-400' : ''
            } hover:shadow-xl hover:border-slate-300`}
            onClick={() => handleRowSelect(expense._id || expense.id)}
          >
            {/* Checkbox */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleRowSelect(expense._id || expense.id)}
                onClick={e => e.stopPropagation()}
                className="w-5 h-5 text-indigo-600 border-2 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 transition-all bg-white"
              />
            </div>
            {/* Actions Menu */}
            <div className="absolute top-4 right-4 z-10 action-menu-container">
              <button 
                onClick={e => { 
                  e.stopPropagation(); 
                  setOpenMenuId(openMenuId === expense._id ? null : expense._id); 
                }} 
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all duration-200 border border-slate-200 bg-white shadow-sm" 
                aria-label="Actions"
              >
                <MoreVertical size={18} />
              </button>
              {openMenuId === expense._id && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-20 animate-fadeIn border border-slate-200">
                  <div className="py-2">
                    <button 
                      onClick={e => { 
                        e.stopPropagation(); 
                        handleEdit(expense._id || expense.id); 
                      }} 
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left transition-all duration-200 rounded-lg mx-1"
                    >
                      <Edit size={16} className="mr-3 text-indigo-500" />
                      <span className="font-medium">Edit</span>
                    </button>
                    <button 
                      onClick={e => { 
                        e.stopPropagation(); 
                        handleDeleteClick(expense._id || expense.id); 
                      }} 
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200 rounded-lg mx-1"
                    >
                      <Trash2 size={16} className="mr-3 text-red-500" />
                      <span className="font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Card Content */}
            <div className="flex flex-col gap-2 pl-10 pr-12">
              {/* Top row: Name & Amount */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-bold text-slate-900 truncate pr-2" title={expense.name}>
                  {expense.name}
                </span>
                <span className={`text-lg font-extrabold font-mono ${amountColor}`}>{formatCurrency(expense.amount)}</span>
              </div>
              {/* Second row: Category & Date */}
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {expense.category}
                  </span>
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(expense.date)}
                </span>
              </div>
              {/* Optional row: details, location, payment method */}
              {(expense.detail || expense.location || expense.payment_method) && (
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  {expense.detail && (
                    <span className="italic truncate" title={expense.detail}>{expense.detail}</span>
                  )}
                  {expense.location && (
                    <span className="flex items-center gap-1" title={expense.location}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {expense.location}
                    </span>
                  )}
                  {expense.payment_method && (
                    <span className="flex items-center gap-1">
                      <PaymentIcon method={expense.payment_method} />
                      {capitalizeWords(expense.payment_method)}
                    </span>
                  )}
                </div>
              )}
              {/* Paid/Pending & Budget Goal */}
              <div className="flex items-center justify-between mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  expense.amount > 0 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    expense.amount > 0 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                  {expense.amount > 0 ? 'Paid' : 'Pending'}
                </span>
                {expense.budget_goal_id && (
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs text-slate-600">
                      Linked to Budget Goal
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* Pagination */}
  {totalRows > perPage && (
    <div className="px-2 sm:px-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 mt-6">
      <div className="text-sm text-slate-600">
        Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{Math.min(endIndex, totalRows)}</span> of <span className="font-bold text-slate-700">{totalRows}</span> expenses
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const isActive = currentPage === index + 1;
                  return (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={
                        'px-3 py-1 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none ' +
                        (isActive
                          ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-300 scale-105'
                          : 'text-slate-600 hover:bg-indigo-100')
                      }
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {index + 1}
                    </button>
                  );
                })}
                </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )}
</div>
      </div>

      {/* Mobile Selection Actions */}
      {selectedRows.size > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-lg p-4 animate-fadeIn z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{selectedRows.size} item{selectedRows.size > 1 ? 's' : ''} selected</span>
            <button
              onClick={() => {
                handleDeleteClick();
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Add Expense Dialog */}
      {showExpenseDialog && (
        <ExpenseDialog
          onClose={() => setShowExpenseDialog(false)}
          onSuccess={handleExpenseAction}
          expenseToEdit={expenseToEdit}
          activeGoals={activeGoals}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteType(null);
          setDeleteId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteType === 'multiple' ? 'Expenses' : 'Expense'}`}
        message={`Are you sure you want to delete ${deleteType === 'multiple' ? 'these expenses' : 'this expense'}?`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <BudgetGoalsExpensesModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        goal={selectedBudgetGoal}
      />
    </div>
  );
};

export default ExpensesTable;