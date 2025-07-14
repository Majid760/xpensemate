import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  CreditCard,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Smartphone,
  Award,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import ExpensesTable from './ExpensesTable';

const ExpenseInsights = ({ detailsPosition = 'below', onAddExpense }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);

  // Mock data generation - replace with actual API calls
  const generateMockData = useCallback(() => {
    const periods = {
      weekly: { days: 7, label: 'This Week' },
      monthly: { days: 30, label: 'This Month' },
      quarterly: { days: 90, label: 'This Quarter' },
      yearly: { days: 365, label: 'This Year' }
    };

    const period = periods[selectedPeriod];
    const categories = [
      { name: 'Food & Dining', icon: Coffee, color: '#ef4444', amount: Math.random() * 500 + 200 },
      { name: 'Transportation', icon: Car, color: '#3b82f6', amount: Math.random() * 300 + 100 },
      { name: 'Shopping', icon: ShoppingBag, color: '#8b5cf6', amount: Math.random() * 400 + 150 },
      { name: 'Housing', icon: Home, color: '#10b981', amount: Math.random() * 800 + 400 },
      { name: 'Entertainment', icon: Smartphone, color: '#f59e0b', amount: Math.random() * 200 + 80 },
      { name: 'Bills & Utilities', icon: CreditCard, color: '#06b6d4', amount: Math.random() * 250 + 120 }
    ];

    const trendData = Array.from({ length: period.days > 30 ? 12 : period.days }, (_, i) => ({
      name: period.days > 30 ? `Month ${i + 1}` : `Day ${i + 1}`,
      amount: Math.random() * 100 + 50,
      budget: Math.random() * 120 + 80
    }));

    const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0);
    const avgDaily = totalSpent / period.days;
    const previousPeriodSpent = totalSpent * (0.8 + Math.random() * 0.4);
    const change = ((totalSpent - previousPeriodSpent) / previousPeriodSpent) * 100;

    return {
      period: period.label,
      totalSpent,
      avgDaily,
      change,
      categories,
      trendData,
      topSpendingDay: 'Tuesday',
      budgetUsed: (totalSpent / (totalSpent * 1.2)) * 100,
      savingsGoal: totalSpent * 0.2,
      streakDays: Math.floor(Math.random() * 15) + 1
    };
  }, [selectedPeriod]);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    const timer = setTimeout(() => {
      setInsights(generateMockData());
      setLoading(false);
      setAnimationKey(prev => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedPeriod, generateMockData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];

  if (loading) {
    return (
      <div className="w-full font-sans py-4 sm:px-6 lg:px-4">
        <div className="relative bg-white/95 overflow-hidden transition-all duration-300 p-4">
          {/* Shimmer Header */}
          <div className="flex items-center gap-3 mb-6 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
            <div>
              <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>
          {/* Shimmer Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                  <div className="h-4 w-12 bg-slate-200 rounded-full" />
                </div>
                <div className="mb-2">
                  <div className="h-6 w-20 bg-slate-200 rounded mb-1" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="h-3 w-24 bg-slate-100 rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans py-4  sm:px-6 lg:px-4">
      {/* Main Card - Project Style */}
      <div className={`relative bg-white/95  overflow-hidden   transition-all duration-300 ${showFullDashboard ? 'p-4' : 'p-2'} overflow-hidden`}>

        {/* Professional header */}
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
          <div className="flex items-center gap-3">
            <button
              onClick={onAddExpense}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 font-medium transition-colors duration-200 flex items-center gap-2 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            >
              <Plus size={18} />
              Add Expense
            </button>

            <button
              onClick={() => setShowFullDashboard(!showFullDashboard)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2.5 font-medium transition-colors duration-200 flex items-center gap-2 focus:ring-2 focus:ring-slate-200 focus:outline-none"
            >
              <div className={`transition-transform duration-200 ${showFullDashboard ? 'rotate-180' : 'rotate-0'}`}>
                {showFullDashboard ? <ChevronUp size={18} /> : <Eye size={18} />}
              </div>
              {showFullDashboard ? "Hide Details" : "View Details"}
            </button>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 pr-10 font-medium focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors duration-200 cursor-pointer"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Professional insights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: DollarSign,
              label: "Total Spent",
              value: formatCurrency(insights.totalSpent),
              change: "+12.5%",
              changeType: "increase",
              description: "vs last period"
            },
            {
              icon: Calendar,
              label: "Daily Average",
              value: formatCurrency(insights.avgDaily),
              change: "-5.2%",
              changeType: "decrease",
              description: "vs last period"
            },
            {
              icon: Target,
              label: "Budget Usage",
              value: `${insights.budgetUsed.toFixed(0)}%`,
              change: `${100 - insights.budgetUsed.toFixed(0)}%`,
              changeType: "neutral",
              description: "remaining"
            },
            {
              icon: Award,
              label: "Tracking Streak",
              value: `${insights.streakDays}`,
              change: "days",
              changeType: "neutral",
              description: "consecutive days"
            }
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:border-indigo-500 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.3)] hover:scale-105 transform"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                  <stat.icon size={16} className="text-slate-600" />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${stat.changeType === 'increase'
                    ? 'bg-green-100 text-green-700'
                    : stat.changeType === 'decrease'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                  {stat.changeType === 'increase' && <TrendingUp size={10} className="inline mr-1" />}
                  {stat.changeType === 'decrease' && <TrendingDown size={10} className="inline mr-1" />}
                  {stat.change}
                </div>
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                {stat.description}
              </div>
            </div>
          ))}
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
                    <AreaChart data={insights.trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -15px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        fill="url(#colorAmount)"
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        stroke="#cbd5e1"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
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
                      onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      {showCategoryBreakdown ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showCategoryBreakdown ? 'Hide' : 'Details'}
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={insights.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {insights.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -15px rgba(0, 0, 0, 0.2)'
                        }}
                        formatter={(value) => [formatCurrency(value), 'Amount']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
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
                    <AreaChart data={insights.trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -15px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        fill="url(#colorAmount)"
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        stroke="#cbd5e1"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
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
                      onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      {showCategoryBreakdown ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showCategoryBreakdown ? 'Hide' : 'Details'}
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={insights.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {insights.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -15px rgba(0, 0, 0, 0.2)'
                        }}
                        formatter={(value) => [formatCurrency(value), 'Amount']}
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