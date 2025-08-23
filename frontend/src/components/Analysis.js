import styles from '../pages/Dashboard.module.css';
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Home, Plane, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import apiService from '../services/apiService';

const iconMap = {
  expense: <DollarSign size={22} className="text-indigo-500" />, // fallback
  payment: <CreditCard size={22} className="text-green-500" />, // fallback
  budget: <TrendingUp size={22} className="text-purple-500" />, // fallback
  Payments: <CreditCard size={22} className="text-indigo-500" />,
  Shopping: <ShoppingCart size={22} className="text-emerald-500" />,
  Travel: <Plane size={22} className="text-blue-500" />,
  Housing: <Home size={22} className="text-orange-500" />,
};

function getActivityIcon(type, category) {
  if (type === 'expense' && iconMap[category]) return iconMap[category];
  if (type === 'payment') return iconMap.payment;
  if (type === 'budget') return iconMap.budget;
  return iconMap.expense;
}

function getActivityTitle(item, type, t) {
  if (type === 'expense') return item.description || t('expensesTable.description');
  if (type === 'payment') return item.description || t('expensesTable.title');
  if (type === 'budget') return item.title || t('budgetGoalsTable.title');
  return t('analysis.title');
}

function getActivityCategory(item, type, t) {
  if (type === 'expense') return item.category_name || item.category || t('expensesTable.category');
  if (type === 'payment') return t('expensesTable.title');
  if (type === 'budget') return item.category_name || item.category || t('budgetGoalsTable.title');
  return '';
}

function getActivityAmount(item, type) {
  if (type === 'expense' || type === 'payment') return `$${item.amount?.toLocaleString()}`;
  if (type === 'budget') return `$${item.amount?.toLocaleString()}`;
  return '';
}

function getActivityTime(item) {
  if (!item.created_at) return '';
  const date = new Date(item.created_at);
  return date.toLocaleString();
}

const AnalysisView = () => {
  const { t } = useTranslation();
  const periodTabs = t('analysis.periodTabs', { returnObjects: true });
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [activity, setActivity] = useState({ daily: { expenses: [], payments: [], budgets: [] }, weekly: { expenses: [], payments: [], budgets: [] }, monthly: { expenses: [], payments: [], budgets: [] } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchActivity();
    setCurrentPage(1);
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      var { data } = await apiService.get('/dashboard/activity', { withCredentials: true });
      data = data.data;
      setActivity(data);
    } catch (err) {
      setError(t('analysis.error'));
    } finally {
      setLoading(false);
    }
  };

  const transactions = [
    ...activity[selectedPeriod]?.expenses.map(item => ({ ...item, _type: 'expense' })),
    ...activity[selectedPeriod]?.payments.map(item => ({ ...item, _type: 'payment' })),
    ...activity[selectedPeriod]?.budgets.map(item => ({ ...item, _type: 'budget' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const paginatedTransactions = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(transactions.length / pageSize);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/20 font-sans relative overflow-hidden transition-all duration-300">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl"></div>
      <div className="flex justify-between items-start mb-4 lg:mb-5 gap-4 lg:gap-6 flex-col lg:flex-row">
          <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 m-0 tracking-tight">
            <Calendar className="text-indigo-500" size={24} />
            {t('analysis.title')}
          </h2>
        </div>
      {/* Period Tabs */}
      <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1 mb-6 w-full max-w-md mx-auto">
        {periodTabs.map((tab) => (
            <button
            key={tab.value}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${selectedPeriod === tab.value ? 'bg-indigo-500 text-white shadow' : 'text-slate-700 hover:bg-indigo-100'}`}
            onClick={() => setSelectedPeriod(tab.value)}
          >
            {tab.label}
            </button>
          ))}
      </div>
      {/* Loading State */}
      {loading && (
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      )}
      {/* Error State */}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}
      {/* Transactions List */}
      {!loading && !error && (
        <div className="transactions-list flex flex-col gap-4">
          {paginatedTransactions.length > 0 ? paginatedTransactions.map((item, index) => (
            <div key={item._id || index} className="flex items-center bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-100/80">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 text-2xl">
                {getActivityIcon(item._type, item.category_name || item.category)}
              </div>
              <div className="flex-1 min-w-0 ml-4">
                <div className="font-bold text-slate-800 text-base truncate">{getActivityTitle(item, item._type, t)}</div>
                <div className="text-xs text-slate-500 truncate">{getActivityTime(item)}</div>
                <div className="text-xs text-slate-400 mt-1">{getActivityCategory(item, item._type, t)}</div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-indigo-600">{getActivityAmount(item, item._type)}</span>
              </div>
            </div>
          )) : (
            <div className="text-center text-slate-500 py-8">
              <p className="font-medium">{t('analysis.noActivity')}</p>
            </div>
          )}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-slate-100 text-slate-700 font-semibold disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {t('analysis.previous')}
          </button>
          <span className="px-2 text-slate-500">{currentPage} / {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-slate-100 text-slate-700 font-semibold disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {t('analysis.next')}
          </button>
        </div>
      )}
      </div>
  );
};

export default AnalysisView;