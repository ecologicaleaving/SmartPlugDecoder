import React from 'react';
import type { BaseComponentProps } from '../../types/Component';

interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string;
  color: 'green' | 'orange' | 'blue';
}

const colorClasses = {
  green: {
    dot: 'bg-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  orange: {
    dot: 'bg-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  blue: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title,
  value,
  color,
  className = '', 
  ...props 
}) => {
  const colors = colorClasses[color];
  
  return (
    <div 
      className={`
        bg-white rounded-lg border ${colors.border} p-6 
        ${className}
      `} 
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
};

export default StatsCard;