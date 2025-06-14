import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { BaseComponentProps } from '../../types/Component';

interface EnergyOverviewProps extends BaseComponentProps {}

const powerData = [
  { time: '00:00', power: 120 },
  { time: '04:00', power: 85 },
  { time: '08:00', power: 180 },
  { time: '12:00', power: 245 },
  { time: '16:00', power: 220 },
  { time: '20:00', power: 195 },
  { time: '23:59', power: 160 },
];

export const EnergyOverview: React.FC<EnergyOverviewProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`} {...props}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Energy Overview</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="text-sm text-slate-400">
              <span className="text-2xl font-bold text-white">2.3</span> kWh
            </div>
            <div className="text-sm text-slate-400">
              <span className="text-xl font-semibold text-white">$37</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">
            <span className="text-2xl font-bold text-white">15.8</span> kWh
          </div>
          <div className="text-sm text-slate-400">
            <span className="text-xl font-semibold text-white">3.2</span> kWh
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={powerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
            />
            <Line 
              type="monotone" 
              dataKey="power" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyOverview;