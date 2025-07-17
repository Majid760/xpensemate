import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Award,
  Eye,
  EyeOff,
  Plus,
  ChevronUp,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import {  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import apiService from '../services/apiService';
import StatCard from './StatCard';

function InsightCard({ icon: Icon, title, value, subtitle, color, textColor, loading }) {
  return (
    <div
      className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg  relative overflow-hidden hover:border-[var(--hover-border-color)] hover:z-10"
      style={{ '--hover-border-color': color }}
    >
      <div className="flex items-center mb-2">
        <div
          className="p-2 rounded-xl bg-slate-100 flex items-center justify-center mr-2"
          style={{ color }}
        >
          <Icon size={20} />
        </div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">{title}</h3>
      </div>
      <div className={`text-lg font-extrabold tracking-tight ${textColor || 'text-slate-900'}`}> 
        {loading ? <span className="inline-block w-12 h-5 bg-slate-200 rounded animate-pulse" /> : value}
      </div>
      {subtitle && (
        <div className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</div>
      )}
    </div>
  );
}

const ExpenseInsights = ({ detailsPosition = 'below', onAddExpense }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodRef = useRef(null);

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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setInsights(null);

    // Build query string
    const params = new URLSearchParams();
    params.append('period', selectedPeriod);
    // (If you add custom range support, append startDate/endDate here)

    apiService.get(`/expenses/stats?${params.toString()}`)
      .then(res => {
        if (!isMounted) return;
        const data = res.data;
        // Basic validation
        if (
          typeof data.totalSpent !== 'number' ||
          !Array.isArray(data.trend) ||
          !Array.isArray(data.categories)
        ) {
          throw new Error('Invalid data format from server');
        }
        setInsights(data);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(
          err.response?.data?.error ||
          err.message ||
          'Failed to load insights'
        );
        setInsights(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];

  if (error) {
    return (
      <div className="w-full font-sans py-4 sm:px-6 lg:px-4">
        <div className="bg-white/95 rounded-2xl p-8 text-center text-red-600 font-semibold shadow">
          <div className="mb-2">⚠️ Error loading insights</div>
          <div className="text-sm">{error}</div>
          <button
            onClick={() => setSelectedPeriod(selectedPeriod)} // retry
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="w-full font-sans py-4  sm:px-6 lg:px-4">
      {/* Main Card - Project Style */}
      <div className={`relative bg-white/95  overflow-hidden   transition-all duration-300 ${showFullDashboard ? 'p-4' : 'p-2'} overflow-hidden`}>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex-1">
            {/* Title section */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
             <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                  Expense Insights
                </h1>
                <p className="text-slate-600 text-sm mt-1">Financial overview and analytics</p>
             </div>
            </div>
          </div>

          {/* Action buttons */}
         <div className="flex flex-wrap items-center gap-4">
           <button
             onClick={onAddExpense}
             className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold text-base shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
           >
             <Plus size={20} />
             Add Expense
           </button>
           <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 shadow-sm">
             <button
               onClick={() => setShowFullDashboard(!showFullDashboard)}
               className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors duration-200 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
             >
               <span className={`transition-transform duration-200 ${showFullDashboard ? 'rotate-180' : 'rotate-0'}`}>{showFullDashboard ? <ChevronUp size={18} /> : <Eye size={18} />}</span>
               <span className="hidden sm:inline">{showFullDashboard ? "Hide Details" : "View Details"}</span>
             </button>
             {/* Custom period dropdown */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            label="Total Spent"
            value={formatCurrency(insights?.totalSpent ?? 0)}
            subtitle="Total spent in this period"
            color="#6366f1"
            loading={loading}
          />
          <StatCard
            icon={Calendar}
            label="Daily Average"
            value={formatCurrency(insights?.dailyAverage ?? 0)}
            subtitle="Average spent per day"
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            icon={Target}
            label="Spending Velocity"
            value={typeof insights?.spendingVelocityPercent === 'number' ? `${insights?.spendingVelocityPercent > 0 ? '+' : ''}${insights?.spendingVelocityPercent.toFixed(1)}%` : 'N/A'}
            subtitle={insights?.spendingVelocityMessage ?? 'vs your usual pace'}
            color="#10b981"
            loading={loading}
          />
          <StatCard
            icon={Award}
            label="Tracking Streak"
            value={`${insights?.trackingStreak ?? 0}`}
            subtitle="consecutive days"
            color="#8b5cf6"
            loading={loading}
          />
        </div>

        {/* Render the ExpensesTable below the insights grid and expanded dashboard */}
        {detailsPosition === 'above' && (
          <div className={`transition-all duration-700 ease-in-out ${showFullDashboard ? 'max-h-screen opacity-100 mt-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className={`space-y-6 transition-all duration-500 ${showFullDashboard ? 'transform translate-y-0' : 'transform translate-y-8'}`}>

              {/* Charts Section */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 ${showFullDashboard ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: showFullDashboard ? '400ms' : '0ms' }}>
                {/* Spending Trend */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-slate-200/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="text-indigo-600" size={24} />
                      Spending Trend
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span>Actual</span>
                      <div className="w-3 h-3 bg-slate-300 rounded-full ml-3"></div>
                      <span>Budget</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={insights?.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => label}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        fill="url(#colorAmount)"
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                        label={({ x, y, value }) =>
                          value > 0 ? (
                            <text x={x} y={y - 10} fill="#6366f1" fontSize={12} textAnchor="middle">
                              {formatCurrency(value)}
                            </text>
                          ) : null
                        }
                      />
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <PieChart className="text-purple-600" size={24} />
                      Categories
                    </h3>
                    <button
                      onClick={() => setShowCategoryBreakdown(v => !v)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      {showCategoryBreakdown ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showCategoryBreakdown ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={insights?.categories ?? []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                        label={({ category, amount }) => `${category}: ${formatCurrency(amount)}`}
                      >
                        {insights?.categories?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [formatCurrency(value), props.payload.category]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Animated details for Category Breakdown */}
              <div
                className={`transition-all duration-500 overflow-hidden ${showCategoryBreakdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                {/* Animated details, e.g., a table of categories with spending */}
                <ul>
                  {insights?.categories?.map(cat => (
                    <li key={cat.category} className="flex justify-between py-2 px-4">
                      <span>{cat.category}</span>
                      <span>{formatCurrency(cat.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>


            </div>
          </div>
        )}
        {detailsPosition === 'below' && (
          <div className={`transition-all duration-700 ease-in-out ${showFullDashboard ? 'max-h-screen opacity-100 mt-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className={`space-y-6 transition-all duration-500 ${showFullDashboard ? 'transform translate-y-0' : 'transform translate-y-8'}`}>

              {/* Charts Section */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 ${showFullDashboard ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: showFullDashboard ? '400ms' : '0ms' }}>
                {/* Spending Trend */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-slate-200/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="text-indigo-600" size={24} />
                      Spending Trend
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span>Actual</span>
                      <div className="w-3 h-3 bg-slate-300 rounded-full ml-3"></div>
                      <span>Budget</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={insights?.trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => label}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        fill="url(#colorAmount)"
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                        label={({ x, y, value }) =>
                          value > 0 ? (
                            <text x={x} y={y - 10} fill="#6366f1" fontSize={12} textAnchor="middle">
                              {formatCurrency(value)}
                            </text>
                          ) : null
                        }
                      />
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <PieChart className="text-purple-600" size={24} />
                      Categories
                    </h3>
            
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={insights?.categories ?? []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                        label={({ category, amount }) => `${category}: ${formatCurrency(amount)}`}
                      >
                        {insights?.categories?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [formatCurrency(value), props.payload.category]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseInsights;