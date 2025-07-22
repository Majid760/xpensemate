import { useEffect, useState, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, TrendingUp, BarChart3, User, DollarSign, Plus, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import StatCard from "./StatCard";
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import apiService from '../services/apiService';

const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const GRADIENT_COLORS = [
  ['#6366f1', '#8b5cf6'],
  ['#10b981', '#06d6a0'],
  ['#f59e0b', '#fbbf24'],
  ['#ef4444', '#f87171'],
  ['#8b5cf6', '#a78bfa']
];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
        <p className="text-slate-600 font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-slate-800 font-semibold" style={{ color: entry.color }}>
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function PaymentInsight({ onAddPayment, selectedPeriod, setSelectedPeriod }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { walletBalance, fetchWalletBalance, loading: walletLoading } = useWallet();

  // Fetch payment stats when selectedPeriod changes
  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        console.log('wowowo this sis data 123');

        const res = await apiService.get(`/payments/stats?period=${selectedPeriod}`);
        console.log('wowowo this sis data', res.data);
        if (isMounted) setInsights(res.data);
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.error ||
            err.message ||
            'Failed to load payment insights.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (selectedPeriod) fetchStats();
    if (selectedPeriod) fetchWalletBalance(selectedPeriod);
    return () => { isMounted = false; };
  }, [selectedPeriod, fetchWalletBalance]);

  // Map API data for charts
  const monthlyData = insights?.monthlyTrend?.map((item) => ({
    month: new Date(2000, item.month - 1, 1).toLocaleString('default', { month: 'short' }),
    total: item.totalAmount,
  })) || [];

  const categoryData = insights?.revenueSources?.map((item) => ({
    name: item.payment_type,
    value: item.totalAmount,
  })) || [];

  const [showDetails, setShowDetails] = useState(false);
  const periodRef = useRef(null);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const detailsRef = useRef(null);

  // Close period dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodRef.current && !periodRef.current.contains(event.target)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">
        {error}
      </div>
    );
  }

  // Do nothing here; always render the cards and pass loading to StatCard

  // Always render cards, even if insights is null/undefined

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-white backdrop-blur-sm transition-all duration-500 p-4 mb-6 mt-2 py-4 sm:px-6 lg:px-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div className="flex-1">
          {/* Title section */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Payment Insights
              </h1>
              <p className="text-slate-600 text-sm mt-1">Comprehensive overview of your payment analytics</p>
            </div>
          </div>
        </div>
        {/* Action buttons */}
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
              onClick={() => setShowDetails(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors duration-200 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            >
              <span className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : 'rotate-0'}`}>{showDetails ? <ChevronUp size={18} /> : <Eye size={18} />}</span>
              <span className="hidden sm:inline">{showDetails ? "Hide Details" : "View Details"}</span>
            </button>
            {/* Period dropdown */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Wallet}
          label="Total Balance"
          value={typeof walletBalance === 'number' ? formatCurrency(walletBalance) : 'N/A'}
          subtitle="Wallet Balance"
          color="#6366f1"
          loading={walletLoading}
        />
        <StatCard
          icon={TrendingUp}
          label={`Growth (${periodOptions.find(opt => opt.value === selectedPeriod)?.label || ''})`}
          value={insights && typeof insights.periodGrowth === 'number' ? `${insights.periodGrowth >= 0 ? '+' : ''}${insights.periodGrowth.toFixed(1)}%` : 'N/A'}
          subtitle={insights && typeof insights.periodGrowth === 'number' ? (insights.periodGrowth >= 0 ? 'Increase from previous period' : 'Decrease from previous period') : ''}
          color="#10b981"
          textColor={insights && typeof insights.periodGrowth === 'number' && insights.periodGrowth >= 0 ? 'text-green-600' : 'text-red-600'}
          loading={loading}
        />
        <StatCard
          icon={BarChart3}
          label="Average Payment"
          value={insights && typeof insights.avgPayment === 'number' ? formatCurrency(insights.avgPayment) : 'N/A'}
          subtitle="Per transaction"
          color="#f59e0b"
          loading={loading}
        />
        <StatCard
          icon={User}
          label="Top Payer"
          value={insights && insights.topPayer ? insights.topPayer : 'N/A'}
          subtitle={insights && typeof insights.topPayerAmount === 'number' && insights.topPayerAmount > 0 ? formatCurrency(insights.topPayerAmount) : ''}
          color="#8b5cf6"
          loading={loading}
        />
      </div>

      {/* Details Section */}
      <div
        ref={detailsRef}
        className={`transition-all duration-700 ease-in-out overflow-hidden ${
          showDetails 
            ? 'max-h-[2000px] opacity-100 translate-y-0' 
            : 'max-h-0 opacity-0 -translate-y-4'
        }`}
        style={{
          transitionProperty: 'max-height, opacity, transform',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Monthly Revenue Trend */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-500 group">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                Monthly Revenue Trend
                {/* You can add a dynamic growth badge here if you calculate it */}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Revenue Sources Pie Chart */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-500">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                Revenue Sources
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <defs>
                    {GRADIENT_COLORS.map((colors, index) => (
                      <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    isAnimationActive={true}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient${index})`}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm font-semibold text-slate-700">{value}</span>
                    )}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentInsight;