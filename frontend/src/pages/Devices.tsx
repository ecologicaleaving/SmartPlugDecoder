import React, { useState } from 'react';
import { Search, Plus, Filter, Grid3X3, List } from 'lucide-react';
import type { BaseComponentProps } from '../types/Component';
import { mockSmartPlugs } from '../utils/mockData';
import { AddDeviceWizard } from '../components/devices';

interface DevicesPageProps extends BaseComponentProps {}

export const DevicesPage: React.FC<DevicesPageProps> = ({ 
  className = '', 
  ...props 
}) => {
  const [devices, setDevices] = useState(mockSmartPlugs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDevice, setShowAddDevice] = useState(false);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'online' && device.isOnline) ||
                         (filterStatus === 'offline' && !device.isOnline);
    return matchesSearch && matchesFilter;
  });

  const handleDeviceAdded = (newDevice: any) => {
    setDevices(prev => [...prev, newDevice]);
  };

  return (
    <div className={className} {...props}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Device Management
            </h1>
            <p className="text-slate-400">
              Manage and monitor all your smart plugs in one place
            </p>
          </div>
          <button
            onClick={() => setShowAddDevice(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                block w-full pl-9 pr-3 py-2 border border-slate-600 rounded-lg
                text-sm placeholder-slate-400 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white
              "
            />
          </div>

          {/* Filter and View Controls */}
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Devices</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-400">
          Showing {filteredDevices.length} of {devices.length} devices
        </div>
      </div>

      {/* Devices Grid/List */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        {filteredDevices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-2">No devices found</p>
            <p className="text-slate-500 text-sm">
              Try adjusting your search criteria or add a new device
            </p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredDevices.map((device) => (
              <DeviceCard 
                key={device.id} 
                device={device} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Device Wizard */}
      <AddDeviceWizard
        isOpen={showAddDevice}
        onClose={() => setShowAddDevice(false)}
        onDeviceAdded={handleDeviceAdded}
      />
    </div>
  );
};

// Device Card Component
interface DeviceCardProps {
  device: any;
  viewMode: 'grid' | 'list';
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, viewMode }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsToggling(false);
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
        <div className="flex items-center space-x-4">
          <div className={`
            w-3 h-3 rounded-full
            ${device.isOnline 
              ? device.isOn 
                ? 'bg-green-500' 
                : 'bg-yellow-500'
              : 'bg-red-500'
            }
          `}></div>
          <div>
            <h3 className="font-medium text-white">{device.name}</h3>
            <p className="text-sm text-slate-400">{device.room}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {device.powerReading?.power?.toFixed(1) || '0.0'}W
            </p>
            <p className="text-xs text-slate-400">
              {device.powerReading?.energy?.toFixed(2) || '0.00'} kWh
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={!device.isOnline || isToggling}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${device.isOnline 
                ? device.isOn 
                  ? 'bg-blue-600' 
                  : 'bg-slate-600'
                : 'bg-slate-600 opacity-50 cursor-not-allowed'
              }
            `}
          >
            <span className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${device.isOn ? 'translate-x-6' : 'translate-x-1'}
            `} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-700 rounded-lg border border-slate-600 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`
          w-3 h-3 rounded-full
          ${device.isOnline 
            ? device.isOn 
              ? 'bg-green-500' 
              : 'bg-yellow-500'
            : 'bg-red-500'
          }
        `}></div>
        <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded">
          {device.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-white text-lg mb-1">{device.name}</h3>
        <p className="text-slate-400 text-sm">{device.room}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">Power</span>
          <span className="text-white font-medium">
            {device.powerReading?.power?.toFixed(1) || '0.0'}W
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Energy Today</span>
          <span className="text-white font-medium">
            {device.powerReading?.energy?.toFixed(2) || '0.00'} kWh
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-sm">
          {device.isOn ? 'On' : 'Off'}
        </span>
        <button
          onClick={handleToggle}
          disabled={!device.isOnline || isToggling}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${device.isOnline 
              ? device.isOn 
                ? 'bg-blue-600' 
                : 'bg-slate-600'
              : 'bg-slate-600 opacity-50 cursor-not-allowed'
            }
          `}
        >
          <span className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${device.isOn ? 'translate-x-6' : 'translate-x-1'}
          `} />
        </button>
      </div>
    </div>
  );
};


export default DevicesPage;