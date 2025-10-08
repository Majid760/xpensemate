import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, TrendingUp, AlertCircle, ChevronDown, Filter, Search, Receipt, Clock, MapPin, Tag } from 'lucide-react';
import BudgetGoalsExpensesModal from './BudgetGoalsExpenses';
import apiService from '../services/apiService';

const BudgetGoalExpensesModal = ({ isOpen, onClose, goal }) => {
const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !goal || !goal._id) return;
    setLoading(true);
    setError(null);
    apiService.get(`/budget-goal/${goal._id}/expenses`, {
      withCredentials: true,
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        const data = res.data.data;
        console.log('this is data ====>', data);
        const expensesArray = Array.isArray(data) ? data : (Array.isArray(data.expenses) ? data.expenses : []);
        setExpenses(expensesArray);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setExpenses([]);
        setLoading(false);
      });
  }, [isOpen, goal?._id]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgExpense = totalExpenses / expenses.length;

  // Calculate spent, remaining, and progress
  const spent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const budgetAmount = goal?.amount || 0;
  const remaining = budgetAmount - spent;
  const progress = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'Credit Card': return 'bg-blue-100 text-blue-800';
      case 'Debit Card': return 'bg-green-100 text-green-800';
      case 'Cash': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExpenses = Array.isArray(expenses) ? expenses.filter(expense => {
    const detail =expense.name + expense.detail  + expense.category;
    const paymentMethod = expense.payment_method || '';
    const matchesSearch =
      detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || paymentMethod === filterBy;
    return matchesSearch && matchesFilter;
  }) : [];

  const sortedExpenses = Array.isArray(filteredExpenses) ? [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return b.amount - a.amount;
      case 'vendor':
        return (a.vendor || '').localeCompare(b.vendor || '');
      default:
        return 0;
    }
  }) : [];

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center p-8">
          <div className="w-full space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex flex-col md:flex-row gap-4 bg-slate-100 rounded-2xl p-6 w-full">
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center p-12">
          <div className="text-2xl text-red-600 font-bold mb-4">Error</div>
          <div className="text-slate-600 mb-6">{error}</div>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{goal?.category} Expenses</h2>
              <p className="text-indigo-100">Budget Goal: {goal?.title || goal?.name}</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-indigo-200" />
                <div>
                  <p className="text-sm text-indigo-200">Total Spent</p>
                  <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-indigo-200" />
                <div>
                  <p className="text-sm text-indigo-200">Average</p>
                  <p className="text-xl font-bold">{formatCurrency(avgExpense)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Receipt size={20} className="text-indigo-200" />
                <div>
                  <p className="text-sm text-indigo-200">Transactions</p>
                  <p className="text-xl font-bold">{expenses.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="vendor">Sort by Vendor</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterBy === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterBy('credit_card')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterBy === 'credit_card' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Credit Card
                </button>
                <button
                  onClick={() => setFilterBy('debit_card')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterBy === 'debit_card' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Debit Card
                </button>
                <button
                  onClick={() => setFilterBy('cash')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterBy === 'cash' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cash
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Budget summary bar (non-intrusive, above expenses list) */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <span className="font-bold">{goal?.title || goal?.name}</span>
              <span className="ml-2 text-xs text-slate-500">({goal?.category})</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-600">Budget: <span className="font-bold">{formatCurrency(goal?.amount || 0)}</span></span>
              <span className="text-xs text-slate-600">Spent: <span className="font-bold">{formatCurrency(spent)}</span></span>
              <span className="text-xs text-slate-600">Remaining: <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(Math.abs(remaining))}{remaining < 0 && ' over'}</span></span>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${progress >= 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          <div className="p-6 space-y-4">
            {(sortedExpenses || []).map((expense) => (
              <div key={expense.id} className="group bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-indigo-300 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Receipt size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{expense.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{expense.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(expense.amount)}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{expense.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(expense.paymentMethod)}`}>
                      {expense.payment_method}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(expense.tags || []).map((tag) => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(sortedExpenses || []).length} of {expenses.length} expenses
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Close
              </button>
              {/* <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200">
                Export Data
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default BudgetGoalExpensesModal;