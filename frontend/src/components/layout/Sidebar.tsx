import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Zap, 
  BarChart3, 
  Settings, 
  Plus,
  X
} from 'lucide-react';
import type { BaseComponentProps } from '../../types/Component';

interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Devices', href: '/devices', icon: Zap, badge: 5 },
  { name: 'Energy Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Add Device', href: '/devices/add', icon: Plus },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  className = '',
  ...props 
}) => {
  const location = useLocation();
  return (
    <div 
      className={`
        flex flex-col w-64 h-screen bg-slate-800 border-r border-slate-700 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}
      {...props}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-white">
              SmartPlug
            </h1>
            <p className="text-xs text-slate-400">Energy Manager</p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-300 hover:bg-slate-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200 w-full
                ${
                  isActive
                    ? 'bg-blue-900 text-blue-400 border-r-2 border-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }
              `}
              onClick={onClose} // Close mobile menu when navigating
            >
              <Icon
                className={`
                  mr-3 flex-shrink-0 h-5 w-5
                  ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-300'
                  }
                `}
              />
              <span className="flex-1">{item.name}</span>
              
              {/* Badge */}
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-900 text-blue-400 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-slate-400">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;