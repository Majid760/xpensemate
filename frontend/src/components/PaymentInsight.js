import React, { useState, useRef } from 'react';
import { Wallet, TrendingUp, BarChart3, User, DollarSign, Plus, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import StatCard from "./StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line } from 'recharts';



const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const dummyMonthlyData = [
  { month: 'Jan', total: 1200, growth: 5.2 },
  { month: 'Feb', total: 1500, growth: 8.1 },
  { month: 'Mar', total: 1100, growth: -2.3 },
  { month: 'Apr', total: 1800, growth: 12.4 },
  { month: 'May', total: 1600, growth: 6.8 },
  { month: 'Jun', total: 2000, growth: 15.2 },
];

const dummyCategoryData = [
  { name: 'Salary', value: 4000, percentage: 57.1 },
  { name: 'Bonus', value: 1200, percentage: 17.1 },
  { name: 'Loan', value: 800, percentage: 11.4 },
  { name: 'Tax', value: 600, percentage: 8.6 },
  { name: 'Other', value: 400, percentage: 5.7 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const GRADIENT_COLORS = [
  ['#6366f1', '#8b5cf6'],
  ['#10b981', '#06d6a0'],
  ['#f59e0b', '#fbbf24'],
  ['#ef4444', '#f87171'],
  ['#8b5cf6', '#a78bfa']
];

const dummyPayerData = [
  { payer: 'Tech Corp', amount: 3500, trend: 12.5 },
  { payer: 'Bank', amount: 2000, trend: -3.2 },
  { payer: 'Client A', amount: 1200, trend: 8.7 },
  { payer: 'Client B', amount: 900, trend: 15.3 },
];

// Custom tooltip components
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

function PaymentInsight({ insights, loading, onAddPayment, selectedPeriod, setSelectedPeriod }) {
  const [showDetails, setShowDetails] = useState(false);
  const periodRef = useRef(null);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const detailsRef = useRef(null);

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

  // Mock insights data for demo
  const mockInsights = {
    totalAmount: 12500,
    paymentCount: 24,
    monthlyGrowth: 12.5,
    thisMonthTotal: 2800,
    averageAmount: 520,
    topPayer: 'Tech Corp',
    topPayerAmount: 3500,
    ...insights
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-white backdrop-blur-sm transition-all duration-500 p-4 mb-6 mt-2 py-6 sm:px-6 lg:px-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <DollarSign className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
              Payment Insights
            </h2>
            <p className="text-slate-600 text-base">Comprehensive overview of your payment analytics</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onAddPayment}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:ring-4 focus:ring-indigo-300/50 focus:outline-none relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Plus size={22} className="relative z-10" />
            <span className="relative z-10">Add Payment</span>
          </button>
          
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-2 shadow-lg">
            <button
              onClick={() => setShowDetails(v => !v)}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-slate-700 bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 focus:ring-3 focus:ring-indigo-200 focus:outline-none shadow-sm hover:shadow-md"
            >
              <span className={`transition-all duration-300 ${showDetails ? 'rotate-180 text-indigo-600' : 'rotate-0'}`}>
                {showDetails ? <ChevronUp size={20} /> : <Eye size={20} />}
              </span>
              <span className="hidden sm:inline">{showDetails ? 'Hide Details' : 'View Details'}</span>
            </button>
            
            <div className="relative" ref={periodRef}>
              <button
                type="button"
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-6 py-3 font-bold text-slate-700 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 focus:outline-none focus:ring-3 focus:ring-indigo-200 shadow-sm hover:shadow-md"
                onClick={() => setIsPeriodOpen(o => !o)}
              >
                <span>{periodOptions.find(opt => opt.value === selectedPeriod)?.label || 'Monthly'}</span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isPeriodOpen ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>
              
              {isPeriodOpen && (
                <div className="absolute mt-3 right-0 w-48 bg-white/95 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                  {periodOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-full text-left px-6 py-4 text-sm font-bold transition-all duration-200 ${
                        selectedPeriod === opt.value 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                          : 'text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700'
                      }`}
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
          label="Total Revenue"
          value={formatCurrency(mockInsights.totalAmount)}
          subtitle={`From ${mockInsights.paymentCount} payments`}
          color="#6366f1"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Growth"
          value={`${mockInsights.monthlyGrowth >= 0 ? '+' : ''}${mockInsights.monthlyGrowth.toFixed(1)}%`}
          subtitle={`This month: ${formatCurrency(mockInsights.thisMonthTotal)}`}
          color="#10b981"
          textColor={mockInsights.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}
          loading={loading}
        />
        <StatCard
          icon={BarChart3}
          label="Average Payment"
          value={formatCurrency(mockInsights.averageAmount)}
          subtitle="Per transaction"
          color="#f59e0b"
          loading={loading}
        />
        <StatCard
          icon={User}
          label="Top Payer"
          value={mockInsights.topPayer}
          subtitle={formatCurrency(mockInsights.topPayerAmount)}
          color="#8b5cf6"
          loading={loading}
        />
      </div>

      {/* Enhanced Animated Details Section */}
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
                <div className="ml-auto text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                  +15.2% this month
                </div>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dummyMonthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                    data={dummyCategoryData}
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
                    {dummyCategoryData.map((entry, index) => (
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
                    formatter={(value, entry) => (
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