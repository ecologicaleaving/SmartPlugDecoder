import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { BaseComponentProps } from '../../types/Component';

interface EnergySourcesProps extends BaseComponentProps {}

const energyData = [
  { name: 'Solar', value: 55, color: '#10b981' },
  { name: 'Grid', value: 45, color: '#3b82f6' },
];

const COLORS = ['#10b981', '#3b82f6'];

export const EnergySources: React.FC<EnergySourcesProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`} {...props}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Energy Sources</h3>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={energyData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {energyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ color: '#94a3b8', fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-slate-300">Solar</span>
          </div>
          <span className="text-sm font-medium text-white">55%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-slate-300">Grid</span>
          </div>
          <span className="text-sm font-medium text-white">45%</span>
        </div>
      </div>
    </div>
  );
};

export default EnergySources;