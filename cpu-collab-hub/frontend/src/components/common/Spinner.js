// src/components/common/Spinner.js
import React from 'react';

const Spinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`animate-spin rounded-full ${sizes[size]} border-4 border-indigo-100 border-t-indigo-600`}></div>
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
};

export default Spinner;
