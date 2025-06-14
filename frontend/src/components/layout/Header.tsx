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
        bg-white border-b border-gray-200 shadow-sm
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
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search devices..."
                  className="
                    block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg
                    text-sm placeholder-gray-500 focus:outline-none focus:ring-2
                    focus:ring-primary-500 focus:border-primary-500
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
                  <span className="hidden sm:block text-sm text-gray-600">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-danger-600" />
                  <span className="hidden sm:block text-sm text-danger-600">
                    Offline
                  </span>
                </>
              )}
            </div>

            {/* Energy status */}
            <div className="hidden sm:flex items-center space-x-2">
              <Battery className="w-4 h-4 text-success-600" />
              <span className="text-sm text-gray-600">
                245W
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              type="button"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
              className="relative p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">JD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-gray-600">5 devices online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              <span className="text-gray-600">245W active consumption</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-gray-600">$2.45 today</span>
            </div>
          </div>
          
          <div className="hidden md:block text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;