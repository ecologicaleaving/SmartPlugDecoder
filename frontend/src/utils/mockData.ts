// Mock data for smart plugs and energy management
// Using explicit imports to avoid any module resolution issues

import type { 
  SmartPlug, 
  DeviceCapabilities, 
  Protocol, 
  PowerReading
} from '../types/Device.js';

import type { 
  EnergyConsumption, 
  EnergyAnalytics, 
  TimePeriod, 
  RealTimeEnergyData,
  DeviceEnergyReading,
  GridStatus,
  GridPhase,
  PowerQualityIndicator,
  QualityStatus,
  UtilityRate,
  RateStructure,
  TaxType,
  TimeRange
} from '../types/Energy.js';

// Now define the constants that are immediately available
export const Protocol_CONST = {
  WIFI: 'wifi' as const,
  ZIGBEE: 'zigbee' as const,
  ZWAVE: 'zwave' as const,
  MATTER: 'matter' as const,
  TUYA: 'tuya' as const,
  UPNP: 'upnp' as const,
};

export const TimePeriod_CONST = {
  HOUR: 'hour' as const,
  DAY: 'day' as const,
  WEEK: 'week' as const,
  MONTH: 'month' as const,
  QUARTER: 'quarter' as const,
  YEAR: 'year' as const,
};

// Mock Smart Plugs Data with explicit typing
export const mockSmartPlugs: SmartPlug[] = [
  {
    id: 'sp-001',
    name: 'Living Room Lamp',
    room: 'Living Room',
    manufacturer: 'Tuya',
    model: 'TY-SP16',
    firmwareVersion: '1.2.3',
    ipAddress: '192.168.1.101',
    macAddress: '00:11:22:33:44:55',
    isOnline: true,
    isOn: true,
    lastSeen: new Date(),
    capabilities: {
      hasPowerMonitoring: true,
      hasScheduling: true,
      hasDimming: false,
      hasEnergyMeter: true,
      maxPower: 3500,
      supportedProtocols: [Protocol_CONST.WIFI, Protocol_CONST.TUYA]
    } as DeviceCapabilities,
    powerReading: {
      timestamp: new Date(),
      voltage: 120.5,
      current: 0.8,
      power: 96.4,
      frequency: 60.0,
      powerFactor: 0.98,
      totalEnergy: 45.2
    } as PowerReading
  },
  {
    id: 'sp-002',
    name: 'Coffee Maker',
    room: 'Kitchen',
    manufacturer: 'TP-Link',
    model: 'Kasa HS110',
    firmwareVersion: '1.0.15',
    ipAddress: '192.168.1.102',
    macAddress: '00:11:22:33:44:56',
    isOnline: true,
    isOn: false,
    lastSeen: new Date(Date.now() - 30000), // 30 seconds ago
    capabilities: {
      hasPowerMonitoring: true,
      hasScheduling: true,
      hasDimming: false,
      hasEnergyMeter: true,
      maxPower: 1200,
      supportedProtocols: [Protocol_CONST.WIFI]
    } as DeviceCapabilities,
    powerReading: {
      timestamp: new Date(),
      voltage: 120.2,
      current: 0.0,
      power: 0.0,
      frequency: 60.0,
      powerFactor: 0.0,
      totalEnergy: 128.7
    } as PowerReading
  },
  {
    id: 'sp-003',
    name: 'Bedroom Fan',
    room: 'Bedroom',
    manufacturer: 'Amazon',
    model: 'Smart Plug',
    firmwareVersion: '2.1.0',
    ipAddress: '192.168.1.103',
    macAddress: '00:11:22:33:44:57',
    isOnline: true,
    isOn: true,
    lastSeen: new Date(),
    capabilities: {
      hasPowerMonitoring: true,
      hasScheduling: true,
      hasDimming: false,
      hasEnergyMeter: true,
      maxPower: 75,
      supportedProtocols: [Protocol_CONST.WIFI, Protocol_CONST.MATTER]
    } as DeviceCapabilities,
    powerReading: {
      timestamp: new Date(),
      voltage: 120.1,
      current: 0.6,
      power: 72.1,
      frequency: 60.0,
      powerFactor: 0.95,
      totalEnergy: 89.3
    } as PowerReading
  },
  {
    id: 'sp-004',
    name: 'Office Monitor',
    room: 'Office',
    manufacturer: 'Wyze',
    model: 'Plug',
    firmwareVersion: '1.1.8',
    ipAddress: '192.168.1.104',
    macAddress: '00:11:22:33:44:58',
    isOnline: false,
    isOn: false,
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    capabilities: {
      hasPowerMonitoring: true,
      hasScheduling: true,
      hasDimming: false,
      hasEnergyMeter: true,
      maxPower: 150,
      supportedProtocols: [Protocol_CONST.WIFI]
    } as DeviceCapabilities,
    powerReading: {
      timestamp: new Date(Date.now() - 300000),
      voltage: 120.0,
      current: 0.0,
      power: 0.0,
      frequency: 60.0,
      powerFactor: 0.0,
      totalEnergy: 245.8
    } as PowerReading
  },
  {
    id: 'sp-005',
    name: 'Garage Lights',
    room: 'Garage',
    manufacturer: 'Govee',
    model: 'H6076',
    firmwareVersion: '1.3.2',
    ipAddress: '192.168.1.105',
    macAddress: '00:11:22:33:44:59',
    isOnline: true,
    isOn: false,
    lastSeen: new Date(),
    capabilities: {
      hasPowerMonitoring: true,
      hasScheduling: true,
      hasDimming: true,
      hasEnergyMeter: true,
      maxPower: 40,
      supportedProtocols: [Protocol_CONST.WIFI]
    } as DeviceCapabilities,
    powerReading: {
      timestamp: new Date(),
      voltage: 120.3,
      current: 0.0,
      power: 0.0,
      frequency: 60.0,
      powerFactor: 0.0,
      totalEnergy: 67.4
    } as PowerReading
  }
];

// Helper functions
export const getDeviceById = (id: string): SmartPlug | undefined => {
  return mockSmartPlugs.find(device => device.id === id);
};

export const getDevicesByRoom = (room: string): SmartPlug[] => {
  return mockSmartPlugs.filter(device => device.room === room);
};

export const getOnlineDevices = (): SmartPlug[] => {
  return mockSmartPlugs.filter(device => device.isOnline);
};

export const getActiveDevices = (): SmartPlug[] => {
  return mockSmartPlugs.filter(device => device.isOnline && device.isOn);
};

export const getTotalPowerConsumption = (): number => {
  return getActiveDevices().reduce((total, device) => {
    return total + (device.powerReading?.power || 0);
  }, 0);
};

export const getRoomList = (): string[] => {
  return [...new Set(mockSmartPlugs.map(device => device.room))];
};

export const getManufacturerList = (): string[] => {
  return [...new Set(mockSmartPlugs.map(device => device.manufacturer))];
};

// Simulate API delays
export const delay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};