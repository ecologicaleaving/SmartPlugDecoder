import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { BaseComponentProps } from '../../types/Component';

interface PowerConsumptionProps extends BaseComponentProps {}

const consumptionData = [
  { day: 'Mon', consumption: 18.5 },
  { day: 'Tue', consumption: 22.1 },
  { day: 'Wed', consumption: 19.8 },
  { day: 'Thu', consumption: 25.3 },
  { day: 'Fri', consumption: 21.7 },
  { day: 'Sat', consumption: 16.2 },
  { day: 'Sun', consumption: 14.9 },
];

export const PowerConsumption: React.FC<PowerConsumptionProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`} {...props}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Energy Consumption</h3>
        <p className="text-sm text-slate-400 mt-1">Weekly overview</p>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={consumptionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="day" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
            />
            <Bar 
              dataKey="consumption" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PowerConsumption;