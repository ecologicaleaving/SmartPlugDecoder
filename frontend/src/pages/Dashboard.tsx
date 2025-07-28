import React from 'react';
import { DashboardHome } from '../components/dashboard/DashboardHome';
import type { BaseComponentProps } from '../types/Component';

interface DashboardPageProps extends BaseComponentProps {}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div className={className} {...props}>
      <DashboardHome />
    </div>
  );
};

export default DashboardPage;