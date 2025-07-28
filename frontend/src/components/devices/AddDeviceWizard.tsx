import React, { useState, useEffect } from 'react';
import { X, Search, Wifi, Plus, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import type { BaseComponentProps } from '../../types/Component';
import { discoveryApi, deviceApi, type DiscoveredDevice as ApiDiscoveredDevice } from '../../services/api';
import webSocketService from '../../services/websocket';

interface AddDeviceWizardProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceAdded: (device: any) => void;
}

type WizardStep = 'scan' | 'select' | 'configure' | 'complete';

// Use the API types
type DiscoveredDevice = ApiDiscoveredDevice;

export const AddDeviceWizard: React.FC<AddDeviceWizardProps> = ({
  isOpen,
  onClose,
  onDeviceAdded,
  className = '',
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null);
  const [deviceConfig, setDeviceConfig] = useState({
    name: '',
    room: '',
    notes: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Set up WebSocket listeners for real-time discovery updates
  useEffect(() => {
    if (!isOpen) return;

    const handleDeviceDiscovered = (device: DiscoveredDevice) => {
      console.log('Device discovered via WebSocket:', device);
      setDiscoveredDevices(prev => {
        // Check if device already exists
        const exists = prev.find(d => d.id === device.id);
        if (exists) return prev;
        return [...prev, device];
      });
    };

    const handleDiscoveryStarted = () => {
      console.log('Discovery started via WebSocket');
      setIsScanning(true);
      setScanError(null);
    };

    const handleDiscoveryCompleted = (data: { devicesFound: number; scanDuration: number }) => {
      console.log('Discovery completed via WebSocket:', data);
      setIsScanning(false);
    };

    const handleDiscoveryError = (data: { error: string }) => {
      console.error('Discovery error via WebSocket:', data);
      setIsScanning(false);
      setScanError(data.error);
    };

    // Add WebSocket event listeners
    webSocketService.addEventListener('device_discovered', handleDeviceDiscovered);
    webSocketService.addEventListener('discovery_started', handleDiscoveryStarted);
    webSocketService.addEventListener('discovery_completed', handleDiscoveryCompleted);
    webSocketService.addEventListener('discovery_error', handleDiscoveryError);

    return () => {
      // Clean up event listeners
      webSocketService.removeEventListener('device_discovered', handleDeviceDiscovered);
      webSocketService.removeEventListener('discovery_started', handleDiscoveryStarted);
      webSocketService.removeEventListener('discovery_completed', handleDiscoveryCompleted);
      webSocketService.removeEventListener('discovery_error', handleDiscoveryError);
    };
  }, [isOpen]);

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      setDiscoveredDevices([]);
      setScanError(null);
      
      console.log('Starting network scan...');
      
      // Start real network discovery via API
      const response = await discoveryApi.startScan({
        protocols: ['upnp'], // Start with UPnP for now
        timeout: 10000, // 10 second timeout
        includeOffline: false,
      });

      console.log('Discovery scan completed:', response);
      
      // WebSocket will handle real-time updates, but we can also set the final result
      if (response.data) {
        setDiscoveredDevices(response.data);
      }
      
    } catch (error) {
      console.error('Discovery scan failed:', error);
      setScanError(error instanceof Error ? error.message : 'Discovery scan failed');
      setIsScanning(false);
    }
  };

  const handleDeviceSelect = (device: DiscoveredDevice) => {
    setSelectedDevice(device);
    setDeviceConfig({
      name: device.name,
      room: 'Living Room',
      notes: '',
    });
    setCurrentStep('configure');
  };

  const handleAddDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      setIsConnecting(true);
      
      console.log('Adding device to user collection:', selectedDevice);
      
      // Add device via API
      const response = await deviceApi.addDevice({
        discoveredDevice: selectedDevice,
        name: deviceConfig.name,
        room: deviceConfig.room || 'Unknown',
        notes: deviceConfig.notes,
      });

      console.log('Device added successfully:', response);
      
      setIsConnecting(false);
      setCurrentStep('complete');
      
      // Add device after a short delay to show success
      setTimeout(() => {
        if (response.data) {
          // Convert API device format to frontend format
          const frontendDevice = {
            id: response.data.id,
            name: response.data.name,
            room: response.data.room || 'Unknown',
            ip: response.data.ipAddress,
            protocol: response.data.protocol,
            manufacturer: response.data.manufacturer,
            model: response.data.model,
            isOnline: response.data.isOnline,
            isOn: false, // Default to off
            powerReading: {
              power: 0,
              voltage: 230,
              current: 0,
              energy: 0,
            },
          };
          onDeviceAdded(frontendDevice);
        }
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to add device:', error);
      setIsConnecting(false);
      setScanError(error instanceof Error ? error.message : 'Failed to add device');
    }
  };

  const handleClose = () => {
    setCurrentStep('scan');
    setDiscoveredDevices([]);
    setSelectedDevice(null);
    setDeviceConfig({ name: '', room: '', notes: '' });
    setIsScanning(false);
    setIsConnecting(false);
    setScanError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`} {...props}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      <div className="relative bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Add New Device</h3>
            <p className="text-slate-400 text-sm mt-1">
              Discover and add smart plugs to your network
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            {[
              { key: 'scan', label: 'Scan Network', icon: Search },
              { key: 'select', label: 'Select Device', icon: Wifi },
              { key: 'configure', label: 'Configure', icon: Plus },
              { key: 'complete', label: 'Complete', icon: CheckCircle },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['scan', 'select', 'configure', 'complete'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                    ${isActive 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-slate-600 text-slate-400'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-8 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-slate-600'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {currentStep === 'scan' && (
            <ScanStep 
              isScanning={isScanning}
              discoveredDevices={discoveredDevices}
              onStartScan={handleStartScan}
              onDeviceSelect={handleDeviceSelect}
              scanError={scanError}
            />
          )}
          
          {currentStep === 'configure' && selectedDevice && (
            <ConfigureStep
              device={selectedDevice}
              config={deviceConfig}
              onChange={setDeviceConfig}
            />
          )}
          
          {currentStep === 'complete' && (
            <CompleteStep deviceName={deviceConfig.name} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            {currentStep === 'configure' && (
              <>
                <button
                  onClick={() => setCurrentStep('scan')}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAddDevice}
                  disabled={isConnecting || !deviceConfig.name.trim()}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                    ${isConnecting || !deviceConfig.name.trim()
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  {isConnecting && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{isConnecting ? 'Connecting...' : 'Add Device'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Scan Step Component
interface ScanStepProps {
  isScanning: boolean;
  discoveredDevices: DiscoveredDevice[];
  onStartScan: () => void;
  onDeviceSelect: (device: DiscoveredDevice) => void;
  scanError: string | null;
}

const ScanStep: React.FC<ScanStepProps> = ({ 
  isScanning, 
  discoveredDevices, 
  onStartScan, 
  onDeviceSelect,
  scanError 
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h4 className="text-lg font-medium text-white mb-2">Scan for Devices</h4>
      <p className="text-slate-400 mb-6">
        Search your local network for compatible smart plugs
      </p>
      
      {!isScanning && discoveredDevices.length === 0 && (
        <button
          onClick={onStartScan}
          className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span>Start Scanning</span>
        </button>
      )}
    </div>

    {isScanning && (
      <div className="text-center py-8">
        <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
        <p className="text-slate-400">Scanning network for devices...</p>
        <p className="text-slate-500 text-sm mt-2">This may take up to 10 seconds</p>
      </div>
    )}

    {scanError && (
      <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
          <div>
            <h5 className="font-medium text-red-400">Scan Failed</h5>
            <p className="text-red-300 text-sm mt-1">{scanError}</p>
          </div>
        </div>
      </div>
    )}

    {discoveredDevices.length > 0 && (
      <div className="space-y-3">
        <h5 className="font-medium text-white">Found Devices ({discoveredDevices.length})</h5>
        {discoveredDevices.map((device) => (
          <div
            key={device.id}
            className={`
              p-4 rounded-lg border border-slate-600 cursor-pointer transition-colors
              ${device.isSupported 
                ? 'hover:border-blue-500 hover:bg-slate-700' 
                : 'opacity-60 cursor-not-allowed'
              }
            `}
            onClick={() => device.isSupported && onDeviceSelect(device)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {device.isSupported ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium text-white">{device.name}</p>
                  <p className="text-sm text-slate-400">
                    {device.manufacturer} • {device.ipAddress} • {device.protocol}
                  </p>
                </div>
              </div>
              {device.isSupported ? (
                <span className="text-xs px-2 py-1 bg-green-900 text-green-400 rounded">
                  Compatible
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-yellow-900 text-yellow-400 rounded">
                  Unsupported
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Configure Step Component
interface ConfigureStepProps {
  device: DiscoveredDevice;
  config: { name: string; room: string; notes: string };
  onChange: (config: any) => void;
}

const ConfigureStep: React.FC<ConfigureStepProps> = ({ device, config, onChange }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-lg font-medium text-white mb-2">Configure Device</h4>
      <p className="text-slate-400">
        Set up your {device.manufacturer} {device.model}
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Device Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => onChange({ ...config, name: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter device name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Room</label>
        <select
          value={config.room}
          onChange={(e) => onChange({ ...config, room: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Living Room">Living Room</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Bathroom">Bathroom</option>
          <option value="Office">Office</option>
          <option value="Garage">Garage</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Notes (Optional)</label>
        <textarea
          value={config.notes}
          onChange={(e) => onChange({ ...config, notes: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add any notes about this device"
          rows={3}
        />
      </div>
    </div>

    <div className="bg-slate-700 rounded-lg p-4">
      <h5 className="font-medium text-white mb-2">Device Information</h5>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">IP Address:</span>
          <span className="text-white">{device.ipAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Protocol:</span>
          <span className="text-white">{device.protocol}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Manufacturer:</span>
          <span className="text-white">{device.manufacturer}</span>
        </div>
        {device.model && (
          <div className="flex justify-between">
            <span className="text-slate-400">Model:</span>
            <span className="text-white">{device.model}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Complete Step Component
interface CompleteStepProps {
  deviceName: string;
}

const CompleteStep: React.FC<CompleteStepProps> = ({ deviceName }) => (
  <div className="text-center py-8">
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
    <h4 className="text-lg font-medium text-white mb-2">Device Added Successfully!</h4>
    <p className="text-slate-400">
      {deviceName} has been connected and added to your device list.
    </p>
  </div>
);

export default AddDeviceWizard;