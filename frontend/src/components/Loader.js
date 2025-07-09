import React from 'react';

const Loader = ({ className = '' }) => {
  return (
    <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FFD86B] ${className}`}></div>
  );
};

export default Loader; 