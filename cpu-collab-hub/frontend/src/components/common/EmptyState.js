// src/components/common/EmptyState.js
import React from 'react';

const EmptyState = ({ icon = '📭', title = 'Nothing here yet', subtitle = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-slate-500 mb-4 max-w-xs">{subtitle}</p>}
    {action && action}
  </div>
);

export default EmptyState;
