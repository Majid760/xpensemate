import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight, Edit, ChevronDown, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

import BudgetGoalDialog from './BudgetGoalPopUp';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import apiService from '../services/apiService';
import Portal from './Portal';
import BudgetGoalsExpensesModal from './BudgetGoalsExpenses';
import BudgetInsights from './BudgetInsights';

const BudgetGoalsTable = () => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [ setShowMobileMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [toast, setToast] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [pageCache, setPageCache] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expensesModalOpen, setExpensesModalOpen] = useState(false);
  const [selectedGoalForExpenses, setSelectedGoalForExpenses] = useState(null);

  // Calculate pagination
  const totalPages = Math.ceil(totalRows / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchGoals = useCallback(async (page, limit) => {
    if (pageCache[page]) {
      setGoals(pageCache[page].goals || []);
      setTotalRows(pageCache[page].total || 0);
      setCurrentPage(pageCache[page].page || 1);
      setPerPage(limit);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.get(`/budget-goals?page=${page}&limit=${limit}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Correctly access the budgetGoals array from the response
      const fetchedGoals = response.data.budgetGoals || [];
      const fetchedTotal = response.data.total || fetchedGoals.length;
      const fetchedPage = response.data.page || 1;


      // Update cache
      setPageCache(prevCache => ({
        ...prevCache,
        [fetchedPage]: { 
          goals: fetchedGoals, 
          total: fetchedTotal, 
          page: fetchedPage 
        }
      }));

      // Update state
      setGoals(fetchedGoals);
      setTotalRows(fetchedTotal);
      setCurrentPage(fetchedPage);
      setPerPage(limit);
    } catch (error) {
      console.error("Error fetching budget goals:", error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to fetch budget goals.';
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }

      setToast({
        type: 'error',
        message: errorMessage
      });

      // Reset state on error
      setGoals([]);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [pageCache]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchGoals(currentPage, perPage);
    }
  }, [isInitialLoad, currentPage, perPage, fetchGoals]);


  // Add error boundary
  useEffect(() => {
    const handleError = (error) => {
      console.error('Global error:', error);
      setToast({
        type: 'error',
        message: 'An unexpected error occurred. Please try refreshing the page.'
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchGoals(newPage, perPage);
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
    if (!goals || goals.length === 0) return;
    
    if (selectedRows.size === goals.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(goals.map(goal => goal._id || goal.id)));
    }
  };

  // delete the chunks of records
  const handleDelete = async () => {
    if (selectedRows.size > 0) {
      // Store original state for potential rollback
      const originalGoals = [...goals];
      const originalTotal = totalRows;

      // Optimistically remove selected items from local state
      setGoals(prev => prev.filter(goal => !selectedRows.has(goal._id || goal.id)));
      setTotalRows(prev => Math.max(0, prev - selectedRows.size));
      setSelectedRows(new Set());

      try {
        // Attempt to delete on backend
        await Promise.all(Array.from(selectedRows).map(id => 
          apiService.delete(`/budget-goal/${id}`, { withCredentials: true })
        ));
        setToast({
          type: 'success',
          message: 'Selected goals deleted successfully!'
        });
      } catch (error) {
        // Revert local state on error
        setGoals(originalGoals);
        setTotalRows(originalTotal);
        console.error("Error deleting selected goals:", error.response?.data || error.message);
        setToast({
          type: 'error',
          message: error.response?.data?.error || 'Failed to delete selected goals.'
        });
      }
    }
  };

  // delete the single record 
  const handleRowDelete = async (id) => {
    setOpenMenuId(null); // Close menu
    // Store original state for potential rollback
    const originalGoals = [...goals];
    const originalTotal = totalRows;
    // Optimistically remove the item from local state
    setGoals(prev => prev.filter(goal => (goal._id || goal.id) !== id));
    setTotalRows(prev => Math.max(0, prev - 1));
    try {
      // Attempt to delete on backend
      await apiService.delete(`/budget-goal/${id}`, { withCredentials: true });
      
      setToast({
        type: 'success',
        message: 'Goal deleted successfully!'
      });
    } catch (error) {
      // Revert local state on error
      setGoals(originalGoals);
      setTotalRows(originalTotal);
      console.error("Error deleting goal:", error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to delete goal.'
      });
    }
  };

  // handle the edit of single record
  const handleEdit = (id) => {
    setOpenMenuId(null);
    const goal = goals.find(g => (g._id || g.id) === id);
    if (goal) {
      setGoalToEdit(goal);
      setShowGoalDialog(true);
    }
  };

  const handleAddNew = () => {
    setGoalToEdit(null);
    setShowGoalDialog(true);
  };

  const handleGoalAction = async (goalData, isEditMode) => {
    setLoading(false);
    try {

      const backendData = {
        name: goalData.name,
        amount: parseFloat(goalData.amount),
        date: goalData.date,
        category_id: goalData.category_id,
        category: goalData.category,
        detail: goalData.detail,
        duration: goalData.duration || 'monthly',
        status: goalData.status || 'active',
        progress: goalData.progress || 0
      };

      if (isEditMode && goalData._id) {
        // Store the original goal for potential rollback
        const originalGoal = goals.find(g => g._id === goalData._id);
        
        // Optimistically update local state
        const updatedGoal = {
          ...originalGoal,
          ...goalData,
          category: goalData.category
        };
        
        setGoals(prev => prev.map(g => 
          g._id === goalData._id ? updatedGoal : g
        ));

        try {
          // Update backend without affecting local state
          await apiService.put(`/budget-goal/${goalData._id}`, backendData, { withCredentials: true });
          setToast({
            type: 'success',
            message: 'Goal updated successfully!'
          });
          
          // Dispatch event to refresh budget goals
          window.dispatchEvent(new CustomEvent('budgetGoalUpdated'));
        } catch (error) {
          // Revert local state on error
          setGoals(prev => prev.map(g => 
            g._id === goalData._id ? originalGoal : g
          ));
          throw error;
        }
      } else {
        // Create new goal
        const tempGoal = {
          ...goalData,
          _id: Date.now().toString(),
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Optimistically add to local state
        setGoals(prev => [tempGoal, ...prev.filter(g => g.id !== tempGoal.id)]);
        setTotalRows(prev => prev + 1);
        setCurrentPage(1);

        try {
          const response = await apiService.post('/create-budget-goal', backendData, { withCredentials: true });
          
          // Update temporary entry with real data
          setGoals(prev => prev.map(g => 
            g._id === tempGoal._id 
              ? { ...response.data, id: response.data._id, category: response.data.category_id ? response.data.category_id.name : response.data.category } 
              : g
          ));
          setToast({
            type: 'success',
            message: 'Goal added successfully!'
          });
          
          // Dispatch event to refresh budget goals
          window.dispatchEvent(new CustomEvent('budgetGoalUpdated'));
        } catch (error) {
          // Remove temporary entry on error
          setGoals(prev => prev.filter(g => g._id !== tempGoal._id));
          setTotalRows(prev => Math.max(0, prev - 1));
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} goal:`, error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'add'} the goal!`
      });
    } finally {
      setLoading(false);
      setShowGoalDialog(false);
      setGoalToEdit(null);
    }
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
        message: `Goal${deleteType === 'multiple' ? 's' : ''} deleted successfully`
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: `Failed to delete goal${deleteType === 'multiple' ? 's' : ''}`
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteType(null);
      setDeleteId(null);
    }
  };

  // Update the handleStatusChange function
  const handleStatusChange = async (goalId, newStatus, e) => {
    // Prevent row selection when clicking the dropdown
    e.stopPropagation();
    
    const originalGoals = [...goals];
    
    try {
      // Find the goal to update
      const goalToUpdate = goals.find(goal => goal._id === goalId);
      if (!goalToUpdate) {
        throw new Error('Goal not found');
      }

      // Prepare the update data with all required fields
      const updateData = {
        name: goalToUpdate.name,
        amount: goalToUpdate.amount,
        date: goalToUpdate.date,
        category_id: goalToUpdate.category_id?._id || goalToUpdate.category_id,
        category: goalToUpdate.category,
        detail: goalToUpdate.detail || '',
        duration: goalToUpdate.duration || 'monthly',
        status: newStatus,
        progress: goalToUpdate.progress || 0
      };

      // Optimistically update local state
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? { ...goal, status: newStatus } : goal
      ));

      // Update backend with all required fields
      await apiService.put(`/budget-goal/${goalId}`, updateData, { withCredentials: true });

      setToast({
        type: 'success',
        message: 'Status updated successfully!'
      });
    } catch (error) {
      // Revert on error
      setGoals(originalGoals);
      console.error("Error updating status:", error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update status.'
      });
    } 
  };

  return (
    <div className="w-full font-sans px-4 sm:px-6 lg:px-8">
      {/* Card Container with gradient border and shadow */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 overflow-visible mx-auto max-w-full transition-all duration-300">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        <BudgetInsights onAddBudget={() => setShowGoalDialog(true)} />

        {/* Header with title and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-8 pt-6 pb-4">
          <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            <Plus className="text-indigo-500" size={28} />
            Budget Goals
          </h2>
        </div>

        {/* Cards Container */}
        <div className="px-2 sm:px-6 pb-6">
          {/* Header with select all checkbox */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={goals && goals.length > 0 && selectedRows.size === goals.length}
                onChange={handleSelectAll}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-600">
                Select All ({selectedRows.size} of {goals.length})
              </span>
            </div>
          </div>

          {/* Goals Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading goals...</p>
            </div>
          ) : !goals || goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-300 mb-4">
                <Plus size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No goals yet</h3>
              <p className="text-slate-500 mb-4">Add your first goal to get started</p>
              <button
                onClick={handleAddNew}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all"
              >
                Add New Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <div
                  key={goal._id || goal.id}
                  onClick={() => {
                    setSelectedGoalForExpenses({
                      name: goal.name,
                      category: goal.category,
                      amount: goal.amount,
                      _id: goal._id
                    });
                    setExpensesModalOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <BudgetGoalCard
                    goal={goal}
                    isSelected={selectedRows.has(goal._id || goal.id)}
                    onSelect={handleRowSelect}
                    onEdit={handleEdit}
                    onDelete={(id) => handleDeleteClick(id)}
                    onStatusChange={(id, status) => handleStatusChange(id, status, { stopPropagation: () => {} })}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalRows > perPage && (
            <div className="px-2 sm:px-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 mt-6">
              <div className="text-sm text-slate-600">
                Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{Math.min(endIndex, totalRows)}</span> of <span className="font-bold text-slate-700">{totalRows}</span> goals
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
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-1 rounded-xl text-sm font-bold transition-all duration-200 ${currentPage === index + 1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-indigo-100'}`}
                    >
                      {index + 1}
                    </button>
                  ))}
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
            <span className="text-sm text-slate-600">
              {selectedRows.size} item{selectedRows.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => {
                handleDeleteClick();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Add Goal Dialog */}
      {showGoalDialog && (
        <BudgetGoalDialog
          onClose={() => setShowGoalDialog(false)}
          onSuccess={handleGoalAction}
          goalToEdit={goalToEdit}
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
        title={`Delete ${deleteType === 'multiple' ? 'Goals' : 'Goal'}`}
        message={`Are you sure you want to delete ${deleteType === 'multiple' ? 'these goals' : 'this goal'}?`}
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

      {/* Expenses Modal */}
      <BudgetGoalsExpensesModal
        isOpen={expensesModalOpen}
        onClose={() => setExpensesModalOpen(false)}
        goal={selectedGoalForExpenses}
      />
    </div>
  );
};

// BudgetGoalCard Component
const BudgetGoalCard = ({ goal, isSelected, onSelect, onEdit, onDelete, onStatusChange }) => {
  const [openStatusId, setOpenStatusId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const statusBtnRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const menuRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [dropdownCoords, setDropdownCoords] = useState({ left: 0, top: 0, width: 0 });

  // When opening the status dropdown, calculate its position
  const handleStatusDropdown = (e) => {
    e.stopPropagation();
    if (openStatusId === goal._id) {
      setOpenStatusId(null);
    } else {
      const rect = statusBtnRef.current.getBoundingClientRect();
      setDropdownCoords({
        left: rect.left,
        top: rect.bottom + window.scrollY,
        width: rect.width
      });
      setOpenStatusId(goal._id);
    }
  };

  const spending = Number(goal.currentSpending) || 0;
  const progress = goal.amount > 0 ? Math.min((spending / goal.amount) * 100, 100) : 0;
  const isExceeded = spending > goal.amount;
  const remaining = goal.amount - spending;

  const goalStatuses = [
    { value: 'active', label: 'Active', color: '#3b82f6' },
    { value: 'achieved', label: 'Achieved', color: '#10b981' },
    { value: 'failed', label: 'Failed', color: '#ef4444' },
    { value: 'terminated', label: 'Terminated', color: '#6b7280' },
    { value: 'other', label: 'Other', color: '#f59e0b' }
  ];

  const getStatusColor = (status) => {
    const statusObj = goalStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#3b82f6';
  };

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 'Invalid Amount';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  };

  // For dot color, use status color or indigo as fallback
  const dotColor = getStatusColor(goal.status);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openStatusId === goal._id &&
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target) &&
        statusBtnRef.current &&
        !statusBtnRef.current.contains(event.target)
      ) {
        setOpenStatusId(null);
      }
      if (
        openMenuId === goal._id &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    }
    if (openStatusId === goal._id || openMenuId === goal._id) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openStatusId, openMenuId, goal._id]);

  return (
    <div
      className={`relative bg-white border border-slate-200 rounded-xl p-5 transition-all duration-200 group cursor-pointer overflow-hidden animate-[fadeIn_0.4s] ${
        isSelected ? 'ring-2 ring-indigo-400 border-indigo-400' : ''
      } hover:shadow-xl hover:border-slate-300`}
    >
      {/* Checkbox */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(goal._id)}
          onClick={e => e.stopPropagation()}
          className="w-5 h-5 text-indigo-600 border-2 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 transition-all bg-white"
        />
      </div>
      {/* Actions Menu */}
      <div className="absolute top-4 right-4 z-[9999] action-menu-container" ref={menuRef}>
        <button 
          onClick={e => { 
            e.stopPropagation(); 
            setOpenMenuId(openMenuId === goal._id ? null : goal._id); 
          }} 
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all duration-200 border border-slate-200 bg-white shadow-sm" 
          aria-label="Actions"
        >
          <MoreVertical size={18} />
        </button>
        {openMenuId === goal._id && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-[9999] animate-fadeIn border border-slate-200">
            <div className="py-2">
              <button 
                onClick={e => { 
                  e.stopPropagation(); 
                  onEdit(goal._id); 
                  setOpenMenuId(null);
                }} 
                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left transition-all duration-200 rounded-lg mx-1"
              >
                <Edit size={16} className="mr-3 text-indigo-500" />
                <span className="font-medium">Edit</span>
              </button>
              <button 
                onClick={e => { 
                  e.stopPropagation(); 
                  onDelete(goal._id); 
                  setOpenMenuId(null);
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
          <span className="text-base font-bold text-slate-900 truncate pr-2" title={goal.name}>
            {goal.name}
          </span>
          <span className="text-lg font-extrabold font-mono text-indigo-600">{formatCurrency(goal.amount)}</span>
        </div>
        {/* Second row: Category & (optional) detail */}
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full`} style={{ background: dotColor }}></span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {goal.category}
            </span>
          </span>
          {goal.detail && (
            <span className="text-xs text-slate-400 italic truncate max-w-[120px] text-right" title={goal.detail}>{goal.detail}</span>
          )}
        </div>
        {/* Progress bar row */}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: isExceeded
                  ? 'linear-gradient(to right, #f87171, #ef4444)'
                  : 'linear-gradient(to right, #3b82f6, #6366f1)'
              }}
            />
          </div>
          <span className="text-xs text-slate-500">{progress.toFixed(0)}% complete</span>
        </div>
        {/* Enhanced details row */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
          {/* Spent */}
          <span className="font-semibold text-indigo-700">{formatCurrency(spending)} spent</span>
          {/* Remaining */}
          <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>{remaining < 0 ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}</span>
          {/* Due date */}
          <span className="flex items-center gap-1 text-slate-500">
            <Calendar size={14} />
            {goal.date ? new Date(goal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
          </span>
          {/* Days left */}
          <span className={`font-semibold ${goal.date && new Date(goal.date) < new Date() ? 'text-red-600' : 'text-slate-500'}`}>{(() => {
            if (!goal.date) return '';
            const today = new Date();
            const due = new Date(goal.date);
            const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            if (diff > 1) return `${diff} days left`;
            if (diff === 1) return '1 day left';
            if (diff === 0) return 'Due today';
            return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''}`;
          })()}</span>
          {/* Status pill with dropdown */}
          <span className="relative z-50">
            <button
              ref={statusBtnRef}
              onClick={handleStatusDropdown}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-all duration-200 ml-2 ${
                'border-slate-200'
              }`}
              style={{ background: '#fff', color: getStatusColor(goal.status), borderColor: getStatusColor(goal.status) + '33' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: getStatusColor(goal.status) }}></span>
              {goalStatuses.find(s => s.value === goal.status)?.label || goal.status}
              <ChevronDown size={14} className="ml-1" />
            </button>
            {openStatusId === goal._id && (
              <Portal>
                <div
                  ref={statusDropdownRef}
                  className="absolute w-32 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-[9999] animate-fadeIn border border-slate-200"
                  style={{
                    left: dropdownCoords.left,
                    top: dropdownCoords.top,
                    position: 'absolute',
                  }}
                >
                  {goalStatuses.map(status => (
                    <button
                      key={status.value}
                      onClick={e => {
                        e.stopPropagation();
                        setOpenStatusId(null);
                        if (goal.status !== status.value) onStatusChange(goal._id, status.value, e);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-xs w-full text-left rounded-lg transition-all duration-200 ${goal.status === status.value ? 'bg-indigo-50 font-bold' : 'hover:bg-slate-50'}`}
                      style={{ color: status.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: status.color }}></span>
                      {status.label}
                    </button>
                  ))}
                </div>
              </Portal>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetGoalsTable;