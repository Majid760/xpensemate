import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import Toast from './Toast';

const BudgetGoalDialog = ({ onClose, onSuccess, goalToEdit }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    detail: '',
    priority: 'high',
    status: 'active'
  });

  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isPriorityOpen, setPriorityOpen] = useState(false);
  const [isStatusOpen, setStatusOpen] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

  const categoryRef = useRef(null);
  const priorityRef = useRef(null);
  const statusRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setPriorityOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Remove auto-generation of name - user will enter it manually

  // Effect to show custom category input when in edit mode
  useEffect(() => {
    if (goalToEdit && goalToEdit.category && !categories.find(c => c.name === goalToEdit.category)) {
      setShowCustomCategoryInput(true);
    }
  }, [goalToEdit]);

  // Update the useEffect for edit mode
  useEffect(() => {
    if (goalToEdit) {
      setFormData({
        _id: goalToEdit._id,
        name: goalToEdit.name || '',
        amount: goalToEdit.amount || '',
        date: goalToEdit.date ? new Date(goalToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: goalToEdit.category || '',
        detail: goalToEdit.detail || '',
        priority: goalToEdit.priority || 'high',
        status: goalToEdit.status || 'active'
      });
    }
  }, [goalToEdit]);

  const categories = [
    { id: '684eecae498dae20b2b32ccf', name: 'FOOD', type: 'budget_goal' },
    { id: '684eed9f498dae20b2b32cd0', name: 'TRANSPORT', type: 'budget_goal' },
    { id: '684eedf8498dae20b2b32cd2', name: 'ENTERTAINMENT', type: 'budget_goal' },
    { id: '684eee2f498dae20b2b32cd3', name: 'SHOPPING', type: 'budget_goal' },
    { id: '684eee5c498dae20b2b32cd4', name: 'UTILITIES', type: 'budget_goal' },
    { id: '684eee87498dae20b2b32cd5', name: 'HEALTHCARE', type: 'budget_goal' },
    { id: '684eeeb2498dae20b2b32cd6', name: 'EDUCATION', type: 'budget_goal' },
    { id: '684eef23498dae20b2b32cd8', name: 'BUSINESS', type: 'budget_goal' },
    { id: '684eef62498dae20b2b32cd9', name: 'TRAVEL', type: 'budget_goal' },
    { id: '68501f534a48c27d97728e8d', name: 'SUBSCRIPTION', type: 'budget_goal' },
    { id: '68501f794a48c27d97728e8e', name: 'RENT', type: 'budget_goal' },
    { id: '68501f974a48c27d97728e8f', name: 'LOAN', type: 'budget_goal' },
    { id: '684eef84498dae20b2b32cda', name: 'OTHER', type: 'budget_goal' },
  ];

  const goalPriorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const goalStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'achieved', label: 'Achieved' },
    { value: 'failed', label: 'Failed' },
    { value: 'terminated', label: 'Terminated' },
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

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'custom') {
      setShowCustomCategoryInput(true);
      handleInputChange('category', '');
    } else {
      setShowCustomCategoryInput(false);
      const selectedCategory = categories.find(c => c.id === categoryId);
      handleInputChange('category', selectedCategory ? selectedCategory.name : '');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > 1000000000) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.detail && formData.detail.length > 500) {
      newErrors.detail = 'Detail cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const isEditMode = !!goalToEdit;

      // Prepare the goal data
      const goalData = {
        ...formData,
        amount: parseFloat(formData.amount),
        status: formData.status
      };

      // Pass the validated data and edit mode flag to parent component
      if (onSuccess) {
        onSuccess(goalData, isEditMode);
      }

      setIsOpen(false);
      if (onClose) onClose();

    } catch (error) {
      setToast({
        type: 'error',
        message: `Failed to ${goalToEdit ? 'update' : 'add'} budget goal`
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
          <h2 className="text-xl sm:text-2xl font-bold text-white">{goalToEdit ? 'Edit Budget Goal' : 'New Budget Goal'}</h2>
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
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                ${ errors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
              placeholder="Enter goal name"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Amount and Date Fields */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                Amount <span className="text-red-500">*</span>
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
                Target Date <span className="text-red-500">*</span>
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
          </div>

          {/* Category and Duration Fields */}
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
                  <span className="truncate capitalize">
                    {showCustomCategoryInput 
                      ? 'Custom Category' 
                      : formData.category || 'Select a category'}
                  </span>
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
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${formData.category === category.name ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          handleCategoryChange(category.id);
                          setCategoryOpen(false);
                        }}
                      >
                      {category.name}
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

            {/* Priority Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                Priority
              </label>
              <div className="relative" ref={priorityRef}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  onClick={() => setPriorityOpen((o) => !o)}
                  disabled={loading}
                >
                  <span className="truncate capitalize">{goalPriorities.find(p => p.value === formData.priority)?.label || 'Select priority'}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isPriorityOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPriorityOpen && (
                  <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-fadeIn">
                  {goalPriorities.map(priority => (
                      <button
                        key={priority.value}
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${formData.priority === priority.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          handleInputChange('priority', priority.value);
                          setPriorityOpen(false);
                        }}
                      >
                      {priority.label}
                      </button>
                  ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
              Status
            </label>
            <div className="relative" ref={statusRef}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  onClick={() => setStatusOpen((o) => !o)}
                disabled={loading}
              >
                  <span className="truncate capitalize">{goalStatuses.find(s => s.value === formData.status)?.label || 'Select status'}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden animate-fadeIn">
                {goalStatuses.map(status => (
                      <button
                        key={status.value}
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${formData.status === status.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          handleInputChange('status', status.value);
                          setStatusOpen(false);
                        }}
                      >
                    {status.label}
                      </button>
                ))}
                  </div>
                )}
            </div>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
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
              {loading ? 'Saving...' : (goalToEdit ? 'Update Goal' : 'Add Goal')}
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BudgetGoalDialog; 