import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Area, AreaChart, LineChart, Line, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, DollarSign, Target, Activity, BarChart3 } from 'lucide-react';
import WeeklyStatsSkeleton from './WeeklyStatsSkeleton';
import { useTranslation } from 'react-i18next';
import apiService from '../services/apiService';
import StatCard from './StatCard';

const COLORS = {
  primary: '#6366f1',
  secondary: '#f1f5f9',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  blue: '#3b82f6',
};

const getDayName = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  // Adjust for timezone offset by creating a UTC date
  const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return utcDate.toLocaleDateString('en-US', { weekday: 'short' });
};

const getFullDayName = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return utcDate.toLocaleDateString('en-US', { weekday: 'long' });
};

function DonutStat({ value, max, label, color = COLORS.primary, icon: Icon, subtitle }) {
  const percentage = max > 0 ? Math.min((Math.abs(value) / max) * 100, 100) : 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  let data, donutColors;

  if (isNegative) {
    data = [
      { name: 'negative', value: Math.abs(value) },
      { name: 'rest', value: Math.max(max - Math.abs(value), 0) },
    ];
    donutColors = [COLORS.danger, 'rgba(239, 68, 68, 0.1)'];
  } else if (isZero) {
    data = [{ name: 'empty', value: max }];
    donutColors = ['rgba(148, 163, 184, 0.1)'];
  } else {
    data = [
      { name: 'value', value },
      { name: 'rest', value: Math.max(max - value, 0) },
    ];
    donutColors = [color, 'rgba(148, 163, 184, 0.1)'];
  }

  return (
    <div className="flex flex-col items-center relative flex-1">
      <div className="w-32 h-32 sm:w-36 sm:h-36 lg:w-44 lg:h-44 relative mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="70%"
              outerRadius="85%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={900}
              animationBegin={0}
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={donutColors[idx]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className={`flex justify-center mb-1 sm:mb-2 transition-all duration-300 ${isNegative ? 'text-red-500' : 'text-indigo-500'}`}>
            <Icon size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
          <div className={`text-lg sm:text-xl lg:text-2xl font-extrabold leading-none mb-1 tracking-tight ${isNegative ? 'text-red-500' : 'text-slate-800'} ${Math.abs(value) >= 100000 ? 'text-base sm:text-lg lg:text-xl' : ''}`}>
            {isNegative ? '-' : ''}${Math.abs(value).toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {percentage.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="text-center px-2">
        <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-1">{label}</h4>
        {subtitle && <p className="text-xs text-slate-500 m-0">{subtitle}</p>}
      </div>
    </div>
  );
}


function DailySpendingChart({ data }) {
  return (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-indigo-500" />
        <h4 className="text-sm sm:text-base font-bold text-slate-800">Daily Spending Pattern</h4>
      </div>
      <div className="h-32 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis hide />
            <Bar
              dataKey="amount"
              fill={COLORS.primary}
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SpendingTrendChart({ data }) {
  return (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-purple-500" />
        <h4 className="text-sm sm:text-base font-bold text-slate-800">Spending Trend</h4>
      </div>
      <div className="h-32 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke={COLORS.purple}
              strokeWidth={2}
              dot={{ r: 3, stroke: COLORS.purple, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 5 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



const WeeklyStats = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [balanceLeft, setBalanceLeft] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [weeklyBudget, setWeeklyBudget] = useState(7000);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [highestDay, setHighestDay] = useState({ total: 0, date: '' });
  const [lowestDay, setLowestDay] = useState({ total: 0, date: '' });
  const [dailySpendingData, setDailySpendingData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  const fetchStats = async (isRefresh = false) => {
    if (!isRefresh) {
      setIsLoading(true);
    }
    try {
      var { data } = await apiService.get('/expenses/weekly-stats', { withCredentials: true });
      data = data.data
      setBalanceLeft(data.balanceLeft);
      setWeekTotal(data.weekTotal);
      setWeeklyBudget(data.weeklyBudget);
      setDailyAverage(data.dailyAverage);
      setHighestDay({
        total: data.highestDay.total || 0,
        date: getFullDayName(data.highestDay.date),
      });
      setLowestDay({
        total: data.lowestDay.total || 0,
        date: getFullDayName(data.lowestDay.date),
      });

      // Process daily spending data for charts
      if (data.days && Array.isArray(data.days)) {

        // Transform the data for the daily spending chart
        const chartData = data.days.map(day => ({
          day: getDayName(day.date),
          amount: parseFloat(day.total) || 0,
          date: day.date
        }));

        setDailySpendingData(chartData);

        // Create cumulative data for trend chart
        let cumulative = 0;
        const cumulativeData = chartData.map(day => {
          cumulative += day.amount;
          return {
            day: day.day,
            cumulative: parseFloat(cumulative.toFixed(2)),
            date: day.date
          };
        });
        setTrendData(cumulativeData);
      } else {
        // Initialize empty data for the current week
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday

        const emptyWeekData = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          emptyWeekData.push({
            day: getDayName(date.toISOString()),
            amount: 0,
            date: date.toISOString()
          });
        }

        setDailySpendingData(emptyWeekData);
        setTrendData(emptyWeekData.map((day, index) => ({
          day: day.day,
          cumulative: 0,
          date: day.date
        })));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Initialize empty data for the current week on error
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday

      const emptyWeekData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        emptyWeekData.push({
          day: getDayName(date.toISOString()),
          amount: 0,
          date: date.toISOString()
        });
      }

      setDailySpendingData(emptyWeekData);
      setTrendData(emptyWeekData.map((day, index) => ({
        day: day.day,
        cumulative: 0,
        date: day.date
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: () => fetchStats(true)
  }));

  useEffect(() => {
    fetchStats();
  }, []);
  const showWarning = balanceLeft < 0;
  if (isLoading) {
    return <WeeklyStatsSkeleton />;
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/20 font-sans max-w-full transition-all duration-300 relative overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl"></div>

      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex justify-between items-start mb-4 lg:mb-5 gap-4 lg:gap-6 flex-col lg:flex-row">
          <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 m-0 tracking-tight">
            <Calendar className="text-indigo-500" size={24} />
            {t('weeklyStats.title')}
          </h2>
        </div>

        {showWarning && (
          <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 font-semibold animate-pulse">
            <AlertTriangle size={20} />
            <span>{t('weeklyStats.budgetExceeded')}</span>
          </div>
        )}
      </div>

      {/* Main Content Layout - Side by Side on Large Screens */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* Left Side - Content */}
        <div className="flex-1 space-y-6 lg:space-y-8">

          {/* Weekly Insights Section */}
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-4 lg:mb-5 tracking-tight">{t('weeklyStats.insights')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                icon={TrendingUp}
                label={t('weeklyStats.highestDay')}
                value={`$${highestDay.total.toLocaleString()}`}
                subtitle={t('weeklyStats.on', { date: highestDay.date || 'N/A' })}
                color={COLORS.success}
              />
              <StatCard
                icon={TrendingDown}
                label={t('weeklyStats.lowestDay')}
                value={`$${lowestDay.total.toLocaleString()}`}
                subtitle={t('weeklyStats.on', { date: lowestDay.date || 'N/A' })}
                color={COLORS.warning}
              />
              <StatCard
                icon={DollarSign}
                label={t('weeklyStats.dailyAverage')}
                value={`$${Math.round(dailyAverage).toLocaleString()}`}
                subtitle={t('weeklyStats.across')}
                color={COLORS.blue}
              />
            </div>
          </div>

          {/* Additional Statistics Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DailySpendingChart data={dailySpendingData} />
              <SpendingTrendChart data={trendData} />
            </div>
          </div>
        </div>

        {/* Right Side - Donut Charts */}
        <div className="lg:w-80 xl:w-96">
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-6 justify-center lg:justify-start">
            <DonutStat
              value={balanceLeft}
              max={weeklyBudget}
              label={t('weeklyStats.balanceRemaining')}
              color={balanceLeft < 0 ? COLORS.danger : COLORS.success}
              icon={DollarSign}
              subtitle={t('weeklyStats.ofBudget', { budget: weeklyBudget.toLocaleString() })}
            />
            <DonutStat
              value={weekTotal}
              max={weeklyBudget}
              label={t('weeklyStats.totalExpenses')}
              color={COLORS.primary}
              icon={Target}
              subtitle={t('weeklyStats.thisWeekShort')}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default WeeklyStats;