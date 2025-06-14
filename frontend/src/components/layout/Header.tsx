import React from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  Sun, 
  Moon,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow
} from 'lucide-react';
import type { BaseComponentProps } from '../../types/Component';

interface HeaderProps extends BaseComponentProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  className = '',
  ...props 
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [notifications, setNotifications] = React.useState(3);

  // Simulate connection status
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate connection issues (5% chance)
      setIsOnline(Math.random() > 0.05);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className={`
        bg-slate-800 border-b border-slate-700 shadow-sm
        ${className}
      `}
      {...props}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-300 hover:bg-slate-700"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search devices..."
                  className="
                    block w-full pl-9 pr-3 py-2 border border-slate-600 rounded-lg
                    text-sm placeholder-slate-400 focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white
                  "
                />
              </div>
            </div>
          </div>

          {/* Center section - Status indicators */}
          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-success-600" />
                  <span className="hidden sm:block text-sm text-slate-300">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-danger-600" />
                  <span className="hidden sm:block text-sm text-red-400">
                    Offline
                  </span>
                </>
              )}
            </div>

            {/* Energy status */}
            <div className="hidden sm:flex items-center space-x-2">
              <Battery className="w-4 h-4 text-success-600" />
              <span className="text-sm text-slate-300">
                245W
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              type="button"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-700"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-700"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-600 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">JD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="bg-slate-900 px-4 sm:px-6 lg:px-8 py-2 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-slate-300">5 devices online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              <span className="text-slate-300">245W active consumption</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-slate-300">$2.45 today</span>
            </div>
          </div>
          
          <div className="hidden md:block text-slate-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;