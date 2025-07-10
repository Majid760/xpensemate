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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';

const ExpenseInsights = () => {
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
      <div className="w-full max-w-8xl mx-auto p-8">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white/80 animate-pulse">Loading your insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto p-8">
      {/* Compact Header - Default View */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 size={36} />
              Expense Insights
            </h1>
            <p className="text-white/80 text-lg">Your financial journey at a glance</p>
            
            {/* Quick Stats in Header */}
            <div className={`mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${showFullDashboard ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100'}`}>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} />
                  <div>
                    <p className="text-sm text-white/80">Total Spent</p>
                    <p className="text-lg font-bold">{formatCurrency(insights.totalSpent)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <div>
                    <p className="text-sm text-white/80">Daily Avg</p>
                    <p className="text-lg font-bold">{formatCurrency(insights.avgDaily)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Target size={20} />
                  <div>
                    <p className="text-sm text-white/80">Budget Used</p>
                    <p className="text-lg font-bold">{insights.budgetUsed.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Award size={20} />
                  <div>
                    <p className="text-sm text-white/80">Streak</p>
                    <p className="text-lg font-bold">{insights.streakDays} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFullDashboard(!showFullDashboard)}
              className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white rounded-xl px-6 py-3 focus:ring-2 focus:ring-white/50 focus:border-white/50 font-medium transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
            >
              <div className={`transition-transform duration-300 ${showFullDashboard ? 'rotate-180' : 'rotate-0'}`}>
                {showFullDashboard ? <ChevronUp size={20} /> : <Eye size={20} />}
              </div>
              {showFullDashboard ? "Hide Details" : "View Details"}
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-white/50 font-medium"
            >
              <option value="weekly" className="text-slate-700">Weekly</option>
              <option value="monthly" className="text-slate-700">Monthly</option>
              <option value="quarterly" className="text-slate-700">Quarterly</option>
              <option value="yearly" className="text-slate-700">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expanded Dashboard */}
      <div className={`transition-all duration-700 ease-in-out ${showFullDashboard ? 'max-h-screen opacity-100 mt-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className={`space-y-6 transition-all duration-500 ${showFullDashboard ? 'transform translate-y-0' : 'transform translate-y-8'}`}>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, title: "Total Spent", value: formatCurrency(insights.totalSpent), subtitle: `${insights.period}`, color: "indigo", change: insights.change },
              { icon: Calendar, title: "Daily Average", value: formatCurrency(insights.avgDaily), subtitle: `${insights.streakDays} days`, color: "green" },
              { icon: Target, title: "Savings Goal", value: formatCurrency(insights.savingsGoal), subtitle: `${insights.budgetUsed.toFixed(0)}%`, color: "yellow" },
              { icon: Award, title: "Saving Streak", value: `#${insights.streakDays}`, subtitle: insights.topSpendingDay, color: "purple" }
            ].map((metric, index) => (
              <div 
                key={metric.title}
                className={`bg-white rounded-2xl p-6 shadow-xl border border-slate-200/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  showFullDashboard ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: showFullDashboard ? `${index * 100}ms` : '0ms' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${metric.color}-100 rounded-xl`}>
                    <metric.icon className={`text-${metric.color}-600`} size={24} />
                  </div>
                  {metric.change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${metric.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {metric.change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      {Math.abs(metric.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{metric.value}</h3>
                <p className="text-slate-500 text-sm">{metric.subtitle}</p>
              </div>
            ))}
          </div>

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
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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

          {/* Category Breakdown */}
          <div className={`transition-all duration-500 ${showCategoryBreakdown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white rounded-2xl shadow-xl border border-slate-200/20 overflow-hidden transition-all duration-500 ease-in-out ${showCategoryBreakdown ? 'max-h-screen p-6 transform scale-100' : 'max-h-0 p-0 transform scale-95'}`}>
              <div className={`transition-all duration-300 delay-100 ${showCategoryBreakdown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Eye className="text-green-600" size={24} />
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.categories.map((category, index) => {
                    const Icon = category.icon;
                    const percentage = (category.amount / insights.totalSpent) * 100;
                    return (
                      <div 
                        key={category.name} 
                        className={`flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                          showCategoryBreakdown ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                        }`}
                        style={{ 
                          transitionDelay: showCategoryBreakdown ? `${index * 100 + 200}ms` : '0ms' 
                        }}
                      >
                        <div className="p-3 rounded-xl transform transition-all duration-300 hover:scale-110" style={{ backgroundColor: `${category.color}20` }}>
                          <Icon size={24} color={category.color} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate-800 text-sm">{category.name}</h4>
                            <span className="text-sm font-bold text-slate-700">{formatCurrency(category.amount)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: showCategoryBreakdown ? `${percentage}%` : '0%', 
                                backgroundColor: category.color,
                                transitionDelay: showCategoryBreakdown ? `${index * 150 + 400}ms` : '0ms'
                              }}
                            ></div>
                          </div>
                          <p className={`text-xs text-slate-500 mt-1 transition-all duration-300 ${
                            showCategoryBreakdown ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{ transitionDelay: showCategoryBreakdown ? `${index * 100 + 600}ms` : '0ms' }}>
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Insights Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${showFullDashboard ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: showFullDashboard ? '600ms' : '0ms' }}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold">Smart Insight</h3>
              </div>
              <p className="text-lg mb-2">You're spending 23% less on dining out compared to last month!</p>
              <p className="text-white/80 text-sm">Keep up the great work! You've saved ${Math.floor(insights.savingsGoal)} this period.</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-bold">Budget Alert</h3>
              </div>
              <p className="text-lg mb-2">Your shopping expenses are 15% over budget this month.</p>
              <p className="text-white/80 text-sm">Consider reviewing your shopping habits to stay on track.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseInsights;