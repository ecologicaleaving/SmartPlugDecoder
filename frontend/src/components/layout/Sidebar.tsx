import React from 'react';
import { 
  Home, 
  Zap, 
  BarChart3, 
  Settings, 
  Plus,
  X
} from 'lucide-react';
import { BaseComponentProps } from '../../types';

interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  badge?: string | number;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home, current: true },
  { name: 'Devices', href: '/devices', icon: Zap, current: false, badge: 5 },
  { name: 'Energy Analytics', href: '/analytics', icon: BarChart3, current: false },
  { name: 'Add Device', href: '/devices/add', icon: Plus, current: false },
  { name: 'Settings', href: '/settings', icon: Settings, current: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`
        flex flex-col w-64 h-full bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}
      {...props}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">
              SmartPlug
            </h1>
            <p className="text-xs text-gray-500">Energy Manager</p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${
                  item.current
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
              onClick={(e) => {
                e.preventDefault();
                // Handle navigation here
                console.log(`Navigate to ${item.href}`);
              }}
            >
              <Icon
                className={`
                  mr-3 flex-shrink-0 h-5 w-5
                  ${
                    item.current
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
              />
              <span className="flex-1">{item.name}</span>
              
              {/* Badge */}
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">JD</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;