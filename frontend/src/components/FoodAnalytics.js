import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { ChevronDown, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/apiService';

function capitalize(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const FoodAnalytics = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      var { data } = await apiService.get('/dashboard/expense/stats', { withCredentials: true });
      data = data.data;
      setCategories(data.categories);
      setCategoryData(data.data);
      setSelectedCategory(data.categories[0]); // Select first category by default
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(t('foodAnalytics.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/20 font-sans relative overflow-hidden">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="h-80 bg-slate-200 rounded mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/20 font-sans">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!selectedCategory || !categoryData[selectedCategory]) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/20 font-sans">
        <div className="text-center text-slate-500">{t('foodAnalytics.noData')}</div>
      </div>
    );
  }

  const currentData = categoryData[selectedCategory];
  const total = currentData.reduce((sum, item) => sum + item.value, 0);
  const average = Math.round(total / currentData.length);
  const highest = Math.max(...currentData.map(item => item.value));
  const lowest = Math.min(...currentData.map(item => item.value));

  const getBarColor = (day) => {
    return day === 'Wed' ? '#6366f1' : '#c7d2fe';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-800">{data.fullDay}</p>
          <p className="text-lg font-bold text-indigo-600">${payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#374151"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        className="hidden sm:block"
      >
        ${value}
      </text>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-2 sm:p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg  hover:border-[var(--hover-border-color)]"
    style={{ '--hover-border-color': color }}
    >
      <div
        className="p-2 rounded-xl mb-2 flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        <Icon size={16} className="sm:w-5 sm:h-5" />
      </div>
      <div className="text-md sm:text-l font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
  );

  return (
    <div className="bg-white/95 backdrop-blur-xl  rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/20 font-sans relative overflow-hidden transition-all duration-300">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl"></div>
      
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 lg:mb-5">
          <h2 className="flex items-center gap-3 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 m-0 tracking-tight">
            <Activity className="text-indigo-500" size={20} />
            {selectedCategory ? `${capitalize(selectedCategory)} Analytics` : 'Category Analytics'}
          </h2>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              className="flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm sm:text-base font-semibold text-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-w-[120px]"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{capitalize(selectedCategory)}</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {capitalize(category)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-50/30 border border-slate-200/40 rounded-2xl p-4 sm:p-6 mb-6 lg:mb-8">
        <div className="h-64 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              margin={{ top: 30, right: 10, left: 10, bottom: 5 }}
              barCategoryGap="15%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: '#64748b',
                  fontWeight: '500'
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: '#64748b'
                }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill="#6366f1"
              >
                <LabelList
                  dataKey="value"
                  content={CustomBarLabel}
                />
                {currentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.day)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Cards */}
      <div>
        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-4 lg:mb-5 tracking-tight">{t('foodAnalytics.weeklySummary')}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={DollarSign}
            label={t('foodAnalytics.totalSpent')}
            value={`$${total}`}
            color="#6366f1"
          />
          <StatCard
            icon={TrendingUp}
            label={t('foodAnalytics.dailyAverage')}
            value={`$${average}`}
            color="#10b981"
          />
          <StatCard
            icon={Calendar}
            label={t('foodAnalytics.highestDay')}
            value={`$${highest}`}
            color="#f59e0b"
          />
          <StatCard
            icon={Activity}
            label={t('foodAnalytics.lowestDay')}
            value={`$${lowest}`}
            color="#8b5cf6"
          />
        </div>
      </div>
    </div>
  );
};

export default FoodAnalytics;