import React, { useState, useRef, useEffect } from 'react';
import {
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  ChevronDown,
  Plus,
  Eye,
  ChevronUp
} from 'lucide-react';
import apiService from '../services/apiService';
import { useBudgetGoals } from '../contexts/BudgetGoalsContext';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function StatCard({ icon: Icon, value, label, color, textColor, subtitle, loading }) {
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
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">{label}</h3>
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

const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const BudgetInsights = ({ onAddBudget = () => {} }) => {
  const { goals } = useBudgetGoals();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const periodRef = useRef(null);
  const detailsWrapperRef = useRef(null);
  const [detailsHeight, setDetailsHeight] = useState('auto');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate insights locally from goals
  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!goals || goals.length === 0) {
      setInsights(null);
      setLoading(false);
      return;
    }
    // Filter goals by selectedPeriod if needed (implement your own logic)
    // For now, use all goals
    const activeGoals = goals.filter(g => g.status === 'active');
    const achievedGoals = goals.filter(g => g.status === 'achieved');
    const failedGoals = goals.filter(g => g.status === 'failed');
    const terminatedGoals = goals.filter(g => g.status === 'terminated');
    const totalBudgeted = activeGoals.reduce((sum, g) => sum + (g.amount || 0), 0);
    const avgProgress = achievedGoals.length > 0 ? achievedGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / achievedGoals.length : 0;
    // Closest deadline
    const closestGoals = goals.filter(g => g.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    const overdueGoals = goals.filter(g => g.date && new Date(g.date) < new Date() && !['achieved', 'terminated', 'failed'].includes(g.status));
    setInsights({
      totalGoals: goals.length,
      statusCounts: {
        active: activeGoals.length,
        achieved: achievedGoals.length,
        failed: failedGoals.length,
        terminated: terminatedGoals.length,
        totalActiveBudget: totalBudgeted,
        avgAchievedProgress: avgProgress
      },
      totalActiveBudget: totalBudgeted,
      avgAchievedProgress: avgProgress,
      closestGoals,
      overdueGoals
    });
    setLoading(false);
  }, [goals, selectedPeriod]);

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

  // Animate height for details section
  useEffect(() => {
    const wrapper = detailsWrapperRef.current;
    if (!wrapper) return;
    if (showDetails) {
      wrapper.style.height = wrapper.scrollHeight + 'px';
      wrapper.style.opacity = 1;
      const timeout = setTimeout(() => {
        wrapper.style.height = 'auto';
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      if (wrapper.style.height === 'auto') {
        wrapper.style.height = wrapper.scrollHeight + 'px';
        void wrapper.offsetHeight;
      }
      wrapper.style.height = '0px';
      wrapper.style.opacity = 0;
    }
  }, [showDetails]);

  // Map API data to UI
  const statData = insights ? {
    totalGoals: insights.totalGoals || 0,
    activeGoals: (insights.statusCounts && insights.statusCounts.active) || 0,
    achievedGoals: (insights.statusCounts && insights.statusCounts.achieved) || 0,
    failedGoals: (insights.statusCounts && (insights.statusCounts.failed || 0)),
    terminatedGoals: (insights.statusCounts && (insights.statusCounts.terminated || 0)),
    totalBudgeted: insights.totalActiveBudget || 0,
    avgProgress: Math.round(insights.avgAchievedProgress || 0),
    closestDeadline: (insights.closestGoals && insights.closestGoals[0]?.date) || null,
    overdueGoals: (insights.overdueGoals && insights.overdueGoals.length) || 0,
  } : {};

  return (
    <div className="w-full font-sans py-4 sm:px-6 lg:px-0">
      <div className="relative bg-white/95 transition-all duration-300 p-2">
        {/* Header Row: left = icon/title/subtitle, right = controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">Budget Insights</h2>
              <p className="text-slate-600 text-sm">Overview of your budget goals</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onAddBudget}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold text-base shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            >
              <Plus size={20} />
              Add Budget
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
        {/* Stat Grid */}
        {error && (
          <div className="text-red-600 font-semibold mb-4">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Award}
            value={statData.totalGoals}
            label="Total Goals"
            color="#6366f1"
            textColor="text-slate-900"
            subtitle="Total number of goals"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            value={statData.activeGoals}
            label="Active Goals"
            color="#3b82f6"
            textColor="text-blue-700"
            subtitle="Goals currently active"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle}
            value={statData.achievedGoals}
            label="Achieved"
            color="#10b981"
            textColor="text-green-700"
            subtitle="Goals achieved this period"
            loading={loading}
          />
          <StatCard
            icon={XCircle}
            value={statData.failedGoals + statData.terminatedGoals}
            label="Failed/Terminated"
            color="#ef4444"
            textColor="text-red-700"
            subtitle="Goals not completed"
            loading={loading}
          />
        </div>
        {/* Animated details wrapper */}
        <div
          ref={detailsWrapperRef}
          style={{
            height: showDetails ? 'auto' : 0,
            opacity: showDetails ? 1 : 0,
            transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
            overflow: showDetails ? 'visible' : 'hidden',
            marginTop: showDetails ? '1.5rem' : 0,
            pointerEvents: showDetails ? 'auto' : 'none',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{
              icon: DollarSign,
              value: formatCurrency(statData.totalBudgeted),
              label: 'Total Budgeted',
              color: '#8b5cf6',
              textColor: 'text-purple-700',
              subtitle: 'Total amount budgeted for active goals',
              loading,
            }, {
              icon: TrendingUp,
              value: statData.avgProgress + '%',
              label: 'Avg. Progress',
              color: '#10b981',
              textColor: 'text-emerald-700',
              subtitle: 'Average progress across all goals',
              loading,
            }, {
              icon: Calendar,
              value: formatDate(statData.closestDeadline),
              label: 'Closest Deadline',
              color: '#f59e0b',
              textColor: 'text-orange-700',
              subtitle: 'Next upcoming deadline',
              loading,
            }, {
              icon: AlertTriangle,
              value: statData.overdueGoals,
              label: 'Overdue Goals',
              color: '#ef4444',
              textColor: 'text-red-600',
              subtitle: 'Goals past their deadline',
              loading,
            }].map((props, idx) => (
              <div
                key={props.label}
                className={`transition-all duration-500 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} delay-[${idx * 75}ms]`}
                style={{ transitionDelay: `${idx * 75}ms` }}
              >
                <StatCard {...props} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetInsights;
