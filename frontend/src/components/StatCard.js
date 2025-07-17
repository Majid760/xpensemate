import React from 'react';

function StatCard({ icon: Icon, label, value, subtitle, color, textColor, loading, onClick }) {
  const clickable = typeof onClick === 'function';
  return (
    <div
      className={`bg-slate-50/50 border border-slate-200/50 rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden hover:border-[var(--hover-border-color)] hover:z-10 ${clickable ? 'cursor-pointer hover:brightness-95 active:scale-95' : ''}`}
      style={{ '--hover-border-color': color }}
      onClick={onClick}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      aria-pressed={clickable ? false : undefined}
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

export default StatCard; 