import React from 'react';
import type { BaseComponentProps } from '../../types/Component';
import { mockSmartPlugs } from '../../utils/mockData';

interface DeviceListProps extends BaseComponentProps {}

export const DeviceList: React.FC<DeviceListProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`} {...props}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Devices</h3>
      </div>
      
      <div className="space-y-3">
        {mockSmartPlugs.slice(0, 6).map((device) => (
          <div key={device.id} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className={`
                w-2 h-2 rounded-full
                ${device.isOnline 
                  ? device.isOn 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                  : 'bg-red-500'
                }
              `}></div>
              <div>
                <p className="text-sm font-medium text-white">{device.name}</p>
                <p className="text-xs text-slate-400">{device.isOn ? 'On' : 'Off'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {device.powerReading?.power?.toFixed(1) || '0.0'}W
              </p>
              <p className="text-xs text-slate-400">
                {device.powerReading?.energy?.toFixed(2) || '0.00'} kWh
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;