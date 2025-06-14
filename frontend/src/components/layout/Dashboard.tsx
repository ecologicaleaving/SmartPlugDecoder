import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { BaseComponentProps } from '../../types/Component';

interface DashboardProps extends BaseComponentProps {
  children: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className={`min-h-screen bg-gray-50 ${className}`}
      {...props}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed inset-y-0 left-0 z-50 w-64 lg:static lg:translate-x-0"
      />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          className="sticky top-0 z-30"
        />

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;