import React from 'react';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, description, action }) => {
  const isReactNode = typeof icon !== 'string';
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className={`mb-4 ${isReactNode ? '' : 'text-6xl'}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-700 mb-2">{title}</h3>
      {description && <p className="text-slate-500 mb-6 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

