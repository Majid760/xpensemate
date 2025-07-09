import React, { useState, useEffect, useCallback } from 'react';
import { MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight, Edit, DollarSign } from 'lucide-react';
import ExpenseDialog from './ExpensePopUp';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import apiService from '../services/apiService';
import { useBudgetGoals } from '../contexts/BudgetGoalsContext';
import BudgetGoalsExpensesModal from './BudgetGoalsExpenses';

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
  const { activeGoals, fetchActiveGoals } = useBudgetGoals();
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
        time:expenseData.time,
        location:expenseData.location,
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

  useEffect(() => { fetchActiveGoals(); }, [fetchActiveGoals]);

  return (
    <div className="w-full font-sans px-4 sm:px-6 lg:px-8">
      {/* Card Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 overflow-hidden mx-auto max-w-full transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        
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
          <button 
            onClick={handleAddNew}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-all duration-200 active:scale-95 text-sm"
          >
            <Plus size={16} />
            Add Expense
            </button>
        </div>
      </div>

      {/* Table Container */}
        <div className="overflow-x-auto px-2 sm:px-6 pb-6">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
            <tr>
                <th className="px-3 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={expenses.length > 0 && selectedRows.size === expenses.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
              </th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Description</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Date</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Amount</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Category</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 animate-pulse">Loading expenses...</td>
              </tr>
            ) : expenses.length === 0 ? (
                <tr>
                <td colSpan="7">
                  <div className="text-center py-12">
                      <div className="text-slate-300 mb-4"><Plus size={48} className="mx-auto" /></div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">No expenses yet</h3>
                      <p className="text-slate-500 mb-4">Add your first expense to get started</p>
                      <button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all">Add New Expense</button>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr
                  key={expense._id || expense.id}
                    className={`group cursor-pointer transition-all duration-200 ${selectedRows.has(expense._id || expense.id) ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50'} animate-[fadeIn_0.4s]`}
                  onClick={() => handleRowSelect(expense._id || expense.id)}
                >
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(expense._id || expense.id)}
                        onChange={() => handleRowSelect(expense._id || expense.id)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                  </td>
                    <td className="px-3 py-4 text-sm font-semibold text-slate-800 text-center truncate"><div title={expense.name}>{expense.name}</div></td>
                    <td className="px-3 py-4 text-sm text-slate-600 text-center font-mono">{formatDate(expense.date)}</td>
                    <td className="px-3 py-4 text-sm text-slate-600 text-center font-mono">{formatCurrency(expense.amount)}</td>
                    <td className="px-3 py-4 text-sm font-semibold text-slate-800 text-center truncate"><div title={expense.category}>{expense.category}</div></td>
                    <td className="px-3 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${expense.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {expense.amount > 0 ? 'Paid' : 'Due'}
                    </span>
                  </td>
                    <td className="px-3 py-4 text-center relative action-menu-container">
                      <button onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === expense._id ? null : expense._id); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200" aria-label="Actions">
                        <MoreVertical size={18} />
                    </button>
                    {openMenuId === expense._id && (
                        <div className="absolute right-full -mr-12 top-0 w-32 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-fadeIn">
                        <div className="py-1">
                            <button onClick={e => { e.stopPropagation(); handleEdit(expense._id || expense.id); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-all duration-200">
                              <Edit size={16} className="mr-2" />Edit
                          </button>
                            <button onClick={e => { e.stopPropagation(); handleDeleteClick(expense._id || expense.id); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200">
                              <Trash2 size={16} className="mr-2" />Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalRows > perPage && (
            <div className="px-2 sm:px-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 mt-2">
              <div className="text-xs text-slate-500">
                Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{Math.min(endIndex, totalRows)}</span> of <span className="font-bold text-slate-700">{totalRows}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button key={index + 1} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 ${currentPage === index + 1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-indigo-100'}`}>
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200">
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