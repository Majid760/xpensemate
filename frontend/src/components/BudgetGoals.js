import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2, Target, Trophy, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import apiService from '../services/apiService';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div  className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--hover-border-color)]"
  style={{ '--hover-border-color': color }}>
    <div
      className="p-1.5 rounded-xl rounded-full flex items-center justify-center"
      style={{ backgroundColor: `${color}20`, color: color }}
    >
      <Icon size={20} />
    </div>
    <div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  </div>
);

const BudgetGoalRow = ({ category, setBudget, currentSpending }) => {
  const progress = setBudget > 0 ? Math.min((currentSpending / setBudget) * 100, 100) : 0;
  const isExceeded = currentSpending > setBudget;

  return (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 mb-3 transition-all duration-300 hover:shadow-lg hover:border-indigo-100/80">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 flex items-center gap-4">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
            <Target size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm sm:text-base">{category}</div>
            <div className="text-xs sm:text-sm text-slate-500">
              <span className="font-semibold">${currentSpending.toLocaleString()}</span> spent of ${setBudget.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="w-full sm:w-1/3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Progress</span>
            <span className={`text-xs font-bold ${isExceeded ? 'text-red-500' : 'text-indigo-500'}`}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full">
            <div
              className={`h-2 rounded-full ${isExceeded ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BudgetGoalsSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-[76px] bg-slate-200/80 rounded-2xl" />)}
    </div>
    <div className="h-6 w-1/3 bg-slate-200/80 rounded-lg mb-4"></div>
    <div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-slate-200/80 rounded-2xl p-4 mb-3 h-[88px] sm:h-[72px]"></div>
      ))}
    </div>
  </div>
);

export default function BudgetGoals() {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchData = useCallback(async (page = 1) => {
    const isLoadingFirstPage = page === 1;
    if (isLoadingFirstPage) setLoading(true);
    else setLoadingMore(true);

    try {
      const goalsPromise = apiService.get('/dashboard/budget-goals', {
        withCredentials: true,
        params: { page },
      });

      const statsPromise = isLoadingFirstPage
        ? apiService.get('/dashboard/budget-goals/stats', { withCredentials: true })
        : Promise.resolve(null);

      const [goalsRes, statsRes] = await Promise.all([goalsPromise, statsPromise]);
     


      setGoals(prev => isLoadingFirstPage ? goalsRes.data.data.goals : [...prev, ...goalsRes.data.data.goals]);
      setPagination(goalsRes.data.data.pagination);

      // if (statsRes) {
      //   setStats(statsRes.data);
      // }
      if(goalsRes.data.data.stats){
        setStats(goalsRes.data.data.stats);
      }
      

    } catch (error) {
      console.error("Failed to fetch budget data:", error);
    } finally {
      if (isLoadingFirstPage) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // Listen for budget goal updates and refresh data
  useEffect(() => {
    const handleBudgetGoalUpdate = () => {
      console.log('Budget goal updated, refreshing data...');
      fetchData(1);
    };

    const handleExpenseUpdate = () => {
      console.log('Expense updated, refreshing data...');
      fetchData(1);
    };

    // Add event listeners for budget goal and expense updates
    window.addEventListener('budgetGoalUpdated', handleBudgetGoalUpdate);
    window.addEventListener('expenseUpdated', handleExpenseUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('budgetGoalUpdated', handleBudgetGoalUpdate);
      window.removeEventListener('expenseUpdated', handleExpenseUpdate);
    };
  }, [fetchData]);

 

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-xl  rounded-3xl p-6 shadow-xl border border-slate-200/20 font-sans">

        <BudgetGoalsSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl  p-4 sm:p-6 lg:p-8  shadow-xl border border-slate-200/20 font-sans relative overflow-hidden">
   {/* Gradient top border */}
   <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl"></div>
            {stats && (
         <div className="mb-6 lg:mb-8">
          <div className="flex justify-between items-start mb-4 lg:mb-5 gap-4 lg:gap-6 flex-col lg:flex-row">

            <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 m-0 tracking-tight">
              <Target className="text-indigo-500" size={24} />
              Active Budget Goals Stats
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 mt-8 lg:grid-cols-4 gap-4">
            <StatCard icon={Target} label="Total Goals" value={stats.totalGoals} color="#3b82f6" />
            <StatCard icon={TrendingUp} label="Active Goals" value={stats.activeGoals} color="#10b981" />
            <StatCard icon={Trophy} label="Achieved Goals" value={stats.achievedGoals} color="#f59e0b" />
            <StatCard icon={DollarSign} label="Total Budgeted" value={`$${stats.totalBudgeted.toLocaleString()}`} color="#8b5cf6" />
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Your Goals</h2>
          {pagination.totalGoals > 0 && (
            <span className="text-sm font-semibold text-slate-500">
              {goals.length} of {pagination.totalGoals}
            </span>
          )}
        </div>

        {goals.length > 0 ? (
          goals.slice(0, 3).map(goal => (
            <BudgetGoalRow
              key={goal._id}
              category={goal.category}
              setBudget={goal.setBudget}
              currentSpending={goal.currentSpending}
            />
          ))
        ) : (
          <div className="text-center text-slate-500 py-8">
            <p className="font-medium">No budget goals found.</p>
            <p className="text-sm">Set a budget goal to start tracking.</p>
          </div>
        )}
      </div>

      {pagination.totalGoals > 3 && (
        <div className="mt-4 mb-0 flex justify-center">
          <a
            href="/budget-goals"
            className="bg-indigo-600 text-white font-bold text-sm px-6 py-2 rounded-full hover:bg-indigo-500 active:scale-95 transition-all"
          >
            See more
          </a>
        </div>
      )}
    </div>
  );
}











// another example of desing 


// import React, { useState, useEffect, useCallback } from 'react';
// import { Loader2, Target, Trophy, TrendingUp, DollarSign, Calendar } from 'lucide-react';

// // Mock axios for demonstration
// const axios = {
//   get: async (url, config) => {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     if (url.includes('/dashboard/budget-goals/stats')) {
//       return {
//         data: {
//           totalGoals: 8,
//           activeGoals: 5,
//           achievedGoals: 3,
//           totalBudgeted: 15000
//         }
//       };
//     }
    
//     return {
//       data: {
//         goals: [
//           { _id: '1', category: 'Groceries', setBudget: 800, currentSpending: 650 },
//           { _id: '2', category: 'Entertainment', setBudget: 300, currentSpending: 350 },
//           { _id: '3', category: 'Transportation', setBudget: 500, currentSpending: 420 }
//         ],
//         stats: {
//           totalGoals: 8,
//           activeGoals: 5,
//           achievedGoals: 3,
//           totalBudgeted: 15000
//         },
//         pagination: {
//           currentPage: 1,
//           totalPages: 3,
//           totalGoals: 8
//         }
//       }
//     };
//   }
// };

// const StatCard = ({ icon: Icon, label, value, color }) => (
//   <div className="group relative bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60 rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gray-200/30 overflow-hidden">
//     {/* Animated background gradient */}
//     <div 
//       className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
//       style={{ background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)` }}
//     />
    
//     <div className="relative z-10 flex flex-col items-center text-center space-y-3">
//       <div
//         className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110"
//         style={{ 
//           backgroundColor: `${color}15`,
//           boxShadow: `0 8px 32px ${color}20`
//         }}
//       >
//         <Icon size={28} style={{ color: color }} />
//       </div>
//       <div>
//         <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{value}</div>
//         <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
//       </div>
//     </div>
//   </div>
// );

// const BudgetGoalRow = ({ category, setBudget, currentSpending }) => {
//   const progress = setBudget > 0 ? Math.min((currentSpending / setBudget) * 100, 100) : 0;
//   const isExceeded = currentSpending > setBudget;

//   return (
//     <div className="group relative bg-white border border-gray-200/60 rounded-3xl p-6 mb-4 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 overflow-hidden">
//       {/* Status indicator */}
//       <div className={`absolute top-0 left-0 right-0 h-1 ${isExceeded ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} />
      
//       <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
//         <div className="flex-1 flex items-start lg:items-center gap-4 w-full lg:w-auto">
//           <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200/30">
//             <Target size={24} />
//           </div>
//           <div className="flex-1">
//             <div className="font-bold text-gray-800 text-lg mb-2">{category}</div>
//             <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
//               <span className="text-gray-600">
//                 <span className="font-bold text-gray-800">${currentSpending.toLocaleString()}</span> spent
//               </span>
//               <span className="hidden sm:inline text-gray-400">•</span>
//               <span className="text-gray-600">
//                 of <span className="font-bold text-gray-800">${setBudget.toLocaleString()}</span> budget
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="w-full lg:w-80">
//           <div className="flex justify-between items-center mb-3">
//             <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Progress</span>
//             <div className="flex items-center gap-2">
//               <span className={`text-sm font-bold px-3 py-1 rounded-full ${
//                 isExceeded 
//                   ? 'bg-red-100 text-red-700' 
//                   : 'bg-emerald-100 text-emerald-700'
//               }`}>
//                 {progress.toFixed(0)}%
//               </span>
//             </div>
//           </div>
//           <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
//             <div
//               className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${
//                 isExceeded 
//                   ? 'bg-gradient-to-r from-red-400 to-red-600' 
//                   : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
//               }`}
//               style={{ width: `${progress}%` }}
//             />
//             <div className={`absolute top-0 left-0 h-full w-full rounded-full ${
//               isExceeded 
//                 ? 'shadow-inner shadow-red-200' 
//                 : 'shadow-inner shadow-emerald-200'
//             }`} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const BudgetGoalsSkeleton = () => (
//   <div className="animate-pulse space-y-6">
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//       {[...Array(4)].map((_, i) => (
//         <div key={i} className="h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl" />
//       ))}
//     </div>
//     <div className="space-y-4">
//       <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
//       {[...Array(3)].map((_, i) => (
//         <div key={i} className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl" />
//       ))}
//     </div>
//   </div>
// );

// export default function BudgetGoals() {
//   const [goals, setGoals] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

//   const fetchData = useCallback(async (page = 1) => {
//     const isLoadingFirstPage = page === 1;
//     if (isLoadingFirstPage) setLoading(true);
//     else setLoadingMore(true);

//     try {
//       const goalsPromise = axios.get('/dashboard/budget-goals', {
//         withCredentials: true,
//         params: { page },
//       });

//       const statsPromise = isLoadingFirstPage
//         ? axios.get('/dashboard/budget-goals/stats', { withCredentials: true })
//         : Promise.resolve(null);

//       const [goalsRes, statsRes] = await Promise.all([goalsPromise, statsPromise]);
     
//       setGoals(prev => isLoadingFirstPage ? goalsRes.data.goals : [...prev, ...goalsRes.data.goals]);
//       setPagination(goalsRes.data.pagination);

//       if(goalsRes.data.stats){
//         setStats(goalsRes.data.stats);
//       }

//     } catch (error) {
//       console.error("Failed to fetch budget data:", error);
//     } finally {
//       if (isLoadingFirstPage) setLoading(false);
//       else setLoadingMore(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData(1);
//   }, [fetchData]);

//   const handleLoadMore = () => {
//     if (pagination.currentPage < pagination.totalPages) {
//       fetchData(pagination.currentPage + 1);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl p-8 shadow-2xl shadow-gray-200/40 border border-gray-200/60 font-sans overflow-hidden">
//         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
//         <BudgetGoalsSkeleton />
//       </div>
//     );
//   }

//   return (
//     <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white rounded-3xl p-6 lg:p-8 shadow-2xl shadow-gray-200/40 border border-gray-200/60 font-sans overflow-hidden">
//       {/* Decorative gradient border */}
//       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
//       {/* Background decoration */}
//       <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl -z-10" />
//       <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-2xl -z-10" />

//       {stats && (
//         <div className="mb-8 lg:mb-12">
//           <div className="mb-8">
//             <div className="flex items-center gap-4 mb-2">
//               <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl shadow-lg shadow-indigo-200/30">
//                 <Target className="text-indigo-600" size={28} />
//               </div>
//               <div>
//                 <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
//                   Budget Goals Overview
//                 </h2>
//                 <p className="text-gray-600 font-medium">Track your financial targets and progress</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCard icon={Target} label="Total Goals" value={stats.totalGoals} color="#6366f1" />
//             <StatCard icon={TrendingUp} label="Active Goals" value={stats.activeGoals} color="#10b981" />
//             <StatCard icon={Trophy} label="Achieved Goals" value={stats.achievedGoals} color="#f59e0b" />
//             <StatCard icon={DollarSign} label="Total Budgeted" value={`$${stats.totalBudgeted.toLocaleString()}`} color="#8b5cf6" />
//           </div>
//         </div>
//       )}

//       <div>
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
//           <div>
//             <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight mb-2">
//               Your Active Goals
//             </h3>
//             <p className="text-gray-600 font-medium">Monitor your spending against set budgets</p>
//           </div>
//           {pagination.totalGoals > 0 && (
//             <div className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-bold text-sm px-4 py-2 rounded-2xl border border-indigo-200">
//               {goals.length} of {pagination.totalGoals} goals
//             </div>
//           )}
//         </div>

//         {goals.length > 0 ? (
//           <div className="space-y-4">
//             {goals.slice(0, 3).map(goal => (
//               <BudgetGoalRow
//                 key={goal._id}
//                 category={goal.category}
//                 setBudget={goal.setBudget}
//                 currentSpending={goal.currentSpending}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-16">
//             <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-3xl inline-block mb-6">
//               <Target className="text-gray-400" size={48} />
//             </div>
//             <p className="text-xl font-bold text-gray-600 mb-2">No budget goals found</p>
//             <p className="text-gray-500 font-medium">Set your first budget goal to start tracking your financial progress</p>
//           </div>
//         )}
//       </div>

//       {pagination.totalGoals > 3 && (
//         <div className="mt-8 flex justify-center">
//           <a
//             href="/budget-goals"
//             className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 active:scale-95 transition-all duration-300 overflow-hidden"
//           >
//             <span className="relative z-10">View All Goals</span>
//             <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }