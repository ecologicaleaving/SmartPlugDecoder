import React from 'react';
import type { BaseComponentProps } from '../../types/Component';
import { mockSmartPlugs } from '../../utils/mockData';

interface DeviceOverviewProps extends BaseComponentProps {}

export const DeviceOverview: React.FC<DeviceOverviewProps> = ({ 
  className = '', 
  ...props 
}) => {
  const onlineDevices = mockSmartPlugs.filter(device => device.isOnline);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`} {...props}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Device Overview</h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {onlineDevices.slice(0, 3).map((device) => (
            <div key={device.id} className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4">
                <div className={`
                  w-3 h-3 rounded-full
                  ${device.isOnline ? 'bg-green-500' : 'bg-gray-400'}
                `}></div>
                <div>
                  <h4 className="font-medium text-gray-900">{device.name}</h4>
                  <p className="text-sm text-gray-500">{device.room}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {device.powerReading?.power || 0}W
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceOverview;