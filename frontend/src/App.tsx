import React from 'react';
import { Dashboard } from './components/layout';
import { ToastProvider } from './components/common';
import { mockSmartPlugs, getTotalPowerConsumption, getOnlineDevices } from './utils/mockData';
import './index.css';

function App() {
  const onlineDevices = getOnlineDevices();
  const totalPower = getTotalPowerConsumption();

  return (
    <ToastProvider>
      <Dashboard>
        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to SmartPlug Energy Manager
            </h1>
            <p className="text-gray-600">
              Monitor and control your smart devices to optimize energy consumption
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{onlineDevices.length}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-success-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Power</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(totalPower)}W</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-warning-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${(totalPower * 0.12 * 24 / 1000).toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Overview */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Device Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSmartPlugs.slice(0, 6).map(device => (
                <div key={device.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{device.name}</h3>
                    <div className={`
                      w-3 h-3 rounded-full 
                      ${device.isOnline 
                        ? device.isOn 
                          ? 'bg-success-500' 
                          : 'bg-gray-400'
                        : 'bg-danger-500'
                      }
                    `} />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{device.room}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {device.powerReading?.power.toFixed(1) || '0.0'}W
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border border-primary-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              🚀 Coming Soon
            </h2>
            <p className="text-gray-600 mb-4">
              We're building advanced features for better energy management:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Device scheduling and automation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Energy consumption analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Cost optimization recommendations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Solar panel integration</span>
              </div>
            </div>
          </div>
        </div>
      </Dashboard>
    </ToastProvider>
  );
}

export default App;
