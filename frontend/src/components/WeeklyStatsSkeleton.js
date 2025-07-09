import React from 'react';

const ShimmerBlock = ({ className }) => (
  <div className={`bg-slate-200/80 rounded-lg animate-pulse ${className}`} />
);

const WeeklyStatsSkeleton = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200/20 font-sans max-w-full">
      {/* Header */}
      <div className="mb-8">
        <ShimmerBlock className="h-8 w-3/4 mb-5" />
      </div>

      {/* Insights */}
      <div className="mb-8">
        <ShimmerBlock className="h-6 w-1/4 mb-5" />
        <div className="grid grid-cols-3 gap-4">
          <ShimmerBlock className="h-24 rounded-2xl" />
          <ShimmerBlock className="h-24 rounded-2xl" />
          <ShimmerBlock className="h-24 rounded-2xl" />
        </div>
      </div>
      
      {/* Budget Bar */}
      <div className="mb-8">
         <ShimmerBlock className="h-4 w-1/3 mb-2" />
         <ShimmerBlock className="h-2 w-full" />
      </div>

      {/* Donut Charts */}
      <div className="flex gap-6 justify-center flex-row">
        <div className="flex flex-col items-center flex-1">
          <ShimmerBlock className="w-44 h-44 rounded-full mb-4" />
          <ShimmerBlock className="h-5 w-3/4 mb-2" />
          <ShimmerBlock className="h-4 w-1/2" />
        </div>
        <div className="flex flex-col items-center flex-1">
          <ShimmerBlock className="w-44 h-44 rounded-full mb-4" />
          <ShimmerBlock className="h-5 w-3/4 mb-2" />
          <ShimmerBlock className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default WeeklyStatsSkeleton; 