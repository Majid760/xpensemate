import React, { useRef, useState } from 'react';
import StatCard from './StatCard';
import { Wallet, TrendingUp, BarChart3, User, DollarSign, Plus, Eye, ChevronUp, ChevronDown } from 'lucide-react';

const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

function PaymentInsight({ insights, loading, onAddPayment, showDetails, setShowDetails, selectedPeriod, setSelectedPeriod }) {
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodRef = useRef(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Close period dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodRef.current && !periodRef.current.contains(event.target)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!insights) return null;
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

  return (
    <div className="relative bg-white/95 transition-all px-4 duration-300 p-4 mb-6 mt-2 py-4 sm:px-6 lg:px-8">
      {/* Header Row: left = icon/title/subtitle, right = controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">Payment Insights</h2>
            <p className="text-slate-600 text-sm">Overview of your payments</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onAddPayment}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold text-base shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
          >
            <Plus size={20} />
            Add Payment
          </button>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 shadow-sm">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors duration-200 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            >
              <span className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : 'rotate-0'}`}>{showDetails ? <ChevronUp size={18} /> : <Eye size={18} />}</span>
              <span className="hidden sm:inline">{showDetails ? 'Hide Details' : 'View Details'}</span>
            </button>
            <div className="relative" ref={periodRef}>
              <button
                type="button"
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                onClick={() => setIsPeriodOpen((o) => !o)}
              >
                <span>{periodOptions.find(opt => opt.value === selectedPeriod)?.label || 'Period'}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isPeriodOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPeriodOpen && (
                <div className="absolute mt-2 right-0 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-fadeIn">
                  {periodOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${selectedPeriod === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                      onClick={() => {
                        setSelectedPeriod(opt.value);
                        setIsPeriodOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Revenue"
          value={formatCurrency(insights.totalAmount)}
          subtitle={`From ${insights.paymentCount} payments`}
          color="#6366f1"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Growth"
          value={`${insights.monthlyGrowth >= 0 ? '+' : ''}${insights.monthlyGrowth.toFixed(1)}%`}
          subtitle={`This month: ${formatCurrency(insights.thisMonthTotal)}`}
          color="#10b981"
          textColor={insights.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}
          loading={loading}
        />
        <StatCard
          icon={BarChart3}
          label="Average Payment"
          value={formatCurrency(insights.averageAmount)}
          subtitle="Per transaction"
          color="#f59e0b"
          loading={loading}
        />
        <StatCard
          icon={User}
          label="Top Payer"
          value={insights.topPayer}
          subtitle={formatCurrency(insights.topPayerAmount)}
          color="#06b5cf6"
          loading={loading}
        />
      </div>
    </div>
  );
}

export default PaymentInsight; 