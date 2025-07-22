import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import Toast from './Toast';
import { useBudgetGoals } from '../contexts/BudgetGoalsContext';

const getCurrentTimeHHMM = () => {
  const now = new Date();
  return now.toTimeString().slice(0,5);
};

const ExpenseDialog = ({ onClose, onSuccess, expenseToEdit, activeGoals: propActiveGoals }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: getCurrentTimeHHMM(),
    category_id: '',
    detail: '',
    payment_method: 'cash',
    location: ''
  });

  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isPaymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [isGoalOpen, setGoalOpen] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

  const categoryRef = useRef(null);
  const paymentMethodRef = useRef(null);
  const goalRef = useRef(null);

  const { activeGoals: contextActiveGoals, refreshActiveGoals } = useBudgetGoals();
  const activeGoals = propActiveGoals || contextActiveGoals;
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
      if (paymentMethodRef.current && !paymentMethodRef.current.contains(event.target)) {
        setPaymentMethodOpen(false);
      }
      if (goalRef.current && !goalRef.current.contains(event.target)) {
        setGoalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to pre-fill form when in edit mode and refresh active goals
  useEffect(() => {
    // Refresh active budget goals whenever the popup opens
    refreshActiveGoals();
    
    if (expenseToEdit) {
      // Normalize category_id to string for comparison
      const catId = expenseToEdit.category_id?._id?.toString() || expenseToEdit.category_id?.toString() || '';
      const isPredefined = categories.some(c => c.id === catId);
      setShowCustomCategoryInput(!isPredefined);
      setSelectedGoal(expenseToEdit.budget_goal_id || null);
      setFormData({
        _id: expenseToEdit._id, // Keep the _id for update operation
        name: expenseToEdit.name || '',
        amount: expenseToEdit.amount || '',
        date: expenseToEdit.date ? new Date(expenseToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: expenseToEdit.time || '',
        category_id: isPredefined ? catId : '',
        category: expenseToEdit.category || '',
        detail: expenseToEdit.detail || '',
        payment_method: expenseToEdit.payment_method || 'cash',
        budget_goal_id: expenseToEdit.budget_goal_id || null,
        location: expenseToEdit.location || ''
      });
    } else {
      setShowCustomCategoryInput(false);
      setSelectedGoal(null);
      setFormData(prev => ({
        ...prev,
        time: getCurrentTimeHHMM(),
        category: '',
        category_id: ''
      }));
    }
  }, [expenseToEdit]);

  const categories = [
    { id: '684eecae498dae20b2b32ccf', name: 'FOOD', type: 'expense' },
    { id: '684eed9f498dae20b2b32cd0', name: 'TRANSPORT', type: 'expense' },
    { id: '684eedf8498dae20b2b32cd2', name: 'ENTERTAINMENT', type: 'expense' },
    { id: '684eee2f498dae20b2b32cd3', name: 'SHOPPING', type: 'expense' },
    { id: '684eee5c498dae20b2b32cd4', name: 'UTILITIES', type: 'expense' },
    { id: '684eee87498dae20b2b32cd5', name: 'HEALTHCARE', type: 'expense' },
    { id: '684eeeb2498dae20b2b32cd6', name: 'EDUCATION', type: 'expense' },
    { id: '684eef23498dae20b2b32cd8', name: 'BUSINESS', type: 'expense' },
    { id: '684eef62498dae20b2b32cd9', name: 'TRAVEL', type: 'expense' },
    { id: '68501f534a48c27d97728e8d', name: 'SUBSCRIPTION', type: 'expense' },
    { id: '68501f794a48c27d97728e8e', name: 'RENT', type: 'expense' },
    { id: '68501f974a48c27d97728e8f', name: 'LOAN', type: 'expense' },
    { id: '684eef84498dae20b2b32cda', name: 'OTHER', type: 'expense' },
  
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.length > 150) {
      newErrors.name = 'Name cannot exceed 150 characters';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > 1000000000) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } 

    if (!formData.category_id && !showCustomCategoryInput) {
      newErrors.category = 'Category is required';
    }
    if (showCustomCategoryInput && !formData.category.trim()) {
      newErrors.category = 'Custom category is required';
    }

    if (formData.detail && formData.detail.length > 500) {
      newErrors.detail = 'Detail cannot exceed 500 characters';
    }
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'custom') {
      setShowCustomCategoryInput(true);
      setFormData(prev => ({ ...prev, category: '', category_id: '' }));
    } else {
      setShowCustomCategoryInput(false);
      const selectedCategory = categories.find(c => c.id === categoryId);
      setFormData(prev => ({
        ...prev,
        category_id: selectedCategory ? selectedCategory.id : '',
        category: selectedCategory ? selectedCategory.name : ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const isEditMode = !!expenseToEdit; // Determine if it's edit mode

      // Prepare the expense data
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        category: showCustomCategoryInput
          ? formData.category
          : (categories.find(cat => cat.id === formData.category_id)?.name || formData.category || ''),
        status: 'active',
        budget_goal_id: selectedGoal || null
      };
      if (showCustomCategoryInput) {
        expenseData.category_id = undefined;
      }

      // Pass the validated data and edit mode flag to parent component
      if (onSuccess) {
        onSuccess(expenseData, isEditMode); // Pass isEditMode flag
      }

      setIsOpen(false);
      if (onClose) onClose();

    } catch (error) {
      setToast({
        type: 'error',
        message: `Failed to ${expenseToEdit ? 'update' : 'add'} expense`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl mx-auto transform transition-all max-h-[90vh] overflow-y-auto font-['Poppins']">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-4 bg-indigo-600 sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{expenseToEdit ? 'Edit Expense' : 'New Expense'}</h2>
          <button 
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            className="p-2 text-indigo-100 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 mt-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                ${ errors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
              placeholder="Enter expense name"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Amount and Date Fields */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
              Amount Spent <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                  ${ errors.amount ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                Date 
                {/* <span className="text-red-500">*</span> */}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                    ${ errors.date ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                  disabled={loading}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-600 pointer-events-none" />
              </div>
              {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            </div>
            {/* Time Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                    ${ errors.time ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Category and Payment Method Fields */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            {/* Category Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  onClick={() => setCategoryOpen((o) => !o)}
                  disabled={loading}
                >
                  <span className="truncate capitalize">{showCustomCategoryInput ? 'Custom Category' : (categories.find(c => c.id === formData.category_id)?.name.toLowerCase() || 'Select a category')}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryOpen && (
                  <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${showCustomCategoryInput ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                      onClick={() => {
                        handleCategoryChange('custom');
                        setCategoryOpen(false);
                      }}
                    >
                      + Add Custom Category
                    </button>
                  {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${formData.category_id === category.id && !showCustomCategoryInput ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          handleCategoryChange(category.id);
                          setCategoryOpen(false);
                        }}
                      >
                        {category.name.toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {showCustomCategoryInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="Enter custom category name"
                    className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                      ${ errors.category ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                    disabled={loading}
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>
              )}
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>

            {/* Payment Method Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                Payment Method
              </label>
              <div className="relative" ref={paymentMethodRef}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  onClick={() => setPaymentMethodOpen((o) => !o)}
                  disabled={loading}
                >
                  <span className="truncate capitalize">{paymentMethods.find(m => m.value === formData.payment_method)?.label || 'Select method'}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isPaymentMethodOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPaymentMethodOpen && (
                  <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-fadeIn">
                  {paymentMethods.map(method => (
                      <button
                        key={method.value}
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${formData.payment_method === method.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          handleInputChange('payment_method', method.value);
                          setPaymentMethodOpen(false);
                        }}
                      >
                      {method.label}
                      </button>
                  ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Budget Goal Field (full width, above Note) */}
          <div className="space-y-2 mt-4" ref={goalRef}>
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
              Link to Budget
            </label>
            <div className="relative">
              <button
                type="button"
                className={`w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                onClick={() => setGoalOpen((o) => !o)}
                disabled={loading}
              >
                <span className="truncate capitalize">
                  {selectedGoal
                    ? (activeGoals.find(g => g._id === selectedGoal)?.name || '')
                    : 'No Budget Goal'}
                </span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isGoalOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGoalOpen && (
                <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
                  {activeGoals.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-400 select-none">No active budget goals found.</div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${!selectedGoal ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          setSelectedGoal(null);
                          setGoalOpen(false);
                        }}
                      >
                        No Budget Goal
                      </button>
                      {activeGoals.map(goal => (
                        <button
                          key={goal._id}
                          type="button"
                          className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${selectedGoal === goal._id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                          onClick={() => {
                            setSelectedGoal(goal._id);
                            setGoalOpen(false);
                          }}
                        >
                          {goal.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                ${ errors.location ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
              placeholder="Enter location (max 100 characters)"
              disabled={loading}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          </div>

          {/* Detail Field */}
          <div className="space-y-2">
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
              Note 
            </label>
            <textarea
              value={formData.detail}
              onChange={(e) => handleInputChange('detail', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base resize-y min-h-[80px] transition-all duration-200 outline-none
                ${ errors.detail ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
              placeholder="Add any additional notes (max 500 characters)"
              rows="3"
              disabled={loading}
            ></textarea>
            {errors.detail && <p className="text-red-500 text-sm">{errors.detail}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
              {loading ? 'Saving...' : (expenseToEdit ? 'Update Expense' : 'Add Expense')}
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ExpenseDialog;