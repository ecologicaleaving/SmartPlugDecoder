import React from 'react';
import { EnergyOverview } from './EnergyOverview';
import { PowerConsumption } from './PowerConsumption';
import { EnergySources } from './EnergySources';
import { DeviceList } from './DeviceList';
import type { BaseComponentProps } from '../../types/Component';

interface DashboardHomeProps extends BaseComponentProps {}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Overview - Top Left */}
        <EnergyOverview />
        
        {/* Power Consumption Chart - Top Right */}
        <PowerConsumption />
        
        {/* Device List - Bottom Left */}
        <DeviceList />
        
        {/* Energy Sources - Bottom Right */}
        <EnergySources />
      </div>
    </div>
  );
};

export default DashboardHome;