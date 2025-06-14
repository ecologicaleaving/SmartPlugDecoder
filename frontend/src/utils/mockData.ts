import { 
  SmartPlug, 
  DeviceCapabilities, 
  Protocol, 
  PowerReading, 
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
} from '../types';

// Mock Smart Plugs Data
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
      supportedProtocols: [Protocol.WIFI, Protocol.TUYA]
    },
    powerReading: {
      timestamp: new Date(),
      voltage: 120.5,
      current: 0.8,
      power: 96.4,
      frequency: 60.0,
      powerFactor: 0.98,
      totalEnergy: 45.2
    }
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
      supportedProtocols: [Protocol.WIFI]
    },
    powerReading: {
      timestamp: new Date(),
      voltage: 120.2,
      current: 0.0,
      power: 0.0,
      frequency: 60.0,
      powerFactor: 0.0,
      totalEnergy: 128.7
    }
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
      supportedProtocols: [Protocol.WIFI, Protocol.MATTER]
    },
    powerReading: {
      timestamp: new Date(),
      voltage: 120.1,
      current: 0.6,
      power: 72.1,
      frequency: 60.0,
      powerFactor: 0.95,
      totalEnergy: 89.3
    }
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
      supportedProtocols: [Protocol.WIFI]
    },
    powerReading: {
      timestamp: new Date(Date.now() - 300000),
      voltage: 120.0,
      current: 0.0,
      power: 0.0,
      frequency: 60.0,
      powerFactor: 0.0,
      totalEnergy: 245.8
    }
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
      supportedProtocols: [Protocol.WIFI]
    },
    powerReading: {
      timestamp: new Date(),
      voltage: 120.3,
      current: 0.0,
      power: 0.0,
      frequency: 60.0,
      powerFactor: 0.0,
      totalEnergy: 67.4
    }
  }
];

// Mock Energy Consumption Data
export const generateMockEnergyData = (deviceId: string, days: number = 30): EnergyConsumption[] => {
  const data: EnergyConsumption[] = [];
  const baseConsumption = Math.random() * 5 + 1; // 1-6 kWh base consumption
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some variation and patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.3 : 1.0;
    const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
    
    const energyUsed = baseConsumption * weekendMultiplier * randomVariation;
    const cost = energyUsed * 0.12; // $0.12 per kWh
    
    data.push({
      deviceId,
      timestamp: date,
      energyUsed,
      cost,
      period: TimePeriod.DAY
    });
  }
  
  return data;
};

// Mock Real-time Energy Data
export const generateMockRealTimeData = (): RealTimeEnergyData => {
  const deviceReadings: DeviceEnergyReading[] = mockSmartPlugs
    .filter(device => device.isOnline)
    .map(device => ({
      deviceId: device.id,
      power: device.powerReading?.power || 0,
      voltage: device.powerReading?.voltage || 120,
      current: device.powerReading?.current || 0,
      energyToday: Math.random() * 10 + 1, // 1-11 kWh
      costToday: (Math.random() * 10 + 1) * 0.12, // Cost based on energy
      efficiency: Math.random() * 20 + 80 // 80-100% efficiency
    }));

  const totalPower = deviceReadings.reduce((sum, reading) => sum + reading.power, 0);
  const projectedDailyCost = deviceReadings.reduce((sum, reading) => sum + reading.costToday, 0);

  const gridStatus: GridStatus = {
    frequency: 59.95 + Math.random() * 0.1, // 59.95-60.05 Hz
    voltage: 119.5 + Math.random() * 1.0, // 119.5-120.5 V
    phase: GridPhase.SINGLE,
    qualityIndicators: [
      {
        metric: 'THD (Total Harmonic Distortion)',
        value: Math.random() * 3 + 1, // 1-4%
        unit: '%',
        status: QualityStatus.GOOD
      },
      {
        metric: 'Power Factor',
        value: 0.95 + Math.random() * 0.04, // 0.95-0.99
        unit: '',
        status: QualityStatus.GOOD
      }
    ]
  };

  return {
    timestamp: new Date(),
    totalPower,
    deviceReadings,
    gridStatus,
    costRate: 0.12, // $0.12 per kWh
    projectedDailyCost
  };
};

// Mock Energy Analytics
export const generateMockEnergyAnalytics = (deviceId: string, period: TimePeriod): EnergyAnalytics => {
  const energyData = generateMockEnergyData(deviceId, 30);
  const totalEnergy = energyData.reduce((sum, item) => sum + item.energyUsed, 0);
  const totalCost = energyData.reduce((sum, item) => sum + item.cost, 0);
  const averagePower = totalEnergy / 24 / 30 * 1000; // Convert to watts
  const peakPower = averagePower * 1.5 + Math.random() * 50;
  
  return {
    deviceId,
    period,
    totalEnergy,
    totalCost,
    averagePower,
    peakPower,
    peakPowerTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    efficiency: 85 + Math.random() * 10, // 85-95%
    carbonFootprint: totalEnergy * 0.7, // kg CO2 per kWh
    costSavings: Math.random() * 20 - 10, // -$10 to +$10
    dailyBreakdown: energyData.map(item => ({
      date: item.timestamp,
      totalEnergy: item.energyUsed,
      totalCost: item.cost,
      averagePower: item.energyUsed / 24 * 1000,
      peakPower: item.energyUsed / 24 * 1000 * 1.5,
      hoursActive: Math.random() * 12 + 8, // 8-20 hours
      costPerHour: item.cost / (Math.random() * 12 + 8)
    }))
  };
};

// Mock Utility Rate
export const mockUtilityRate: UtilityRate = {
  id: 'rate-001',
  name: 'Residential Time-of-Use',
  currency: 'USD',
  structure: RateStructure.TIME_OF_USE,
  baseRate: 0.12,
  peakRate: 0.18,
  offPeakRate: 0.08,
  peakHours: [
    {
      startTime: '16:00',
      endTime: '21:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    {
      startTime: '17:00',
      endTime: '20:00',
      days: ['saturday', 'sunday']
    }
  ],
  demandCharge: 8.50, // $8.50 per kW
  connectionFee: 15.00, // $15 monthly
  taxes: [
    {
      name: 'State Tax',
      rate: 5.5,
      type: TaxType.STATE
    },
    {
      name: 'Utility Tax',
      rate: 2.5,
      type: TaxType.UTILITY
    }
  ]
};

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

// Mock API error responses
export const mockApiErrors = {
  deviceNotFound: {
    code: 'DEVICE_NOT_FOUND',
    message: 'Device not found',
    details: {}
  },
  deviceOffline: {
    code: 'DEVICE_OFFLINE',
    message: 'Device is currently offline',
    details: {}
  },
  networkError: {
    code: 'NETWORK_ERROR',
    message: 'Unable to connect to device',
    details: {}
  },
  invalidAction: {
    code: 'INVALID_ACTION',
    message: 'Invalid device action',
    details: {}
  }
};

// Random data generators for testing
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const generateRandomTimestamp = (daysAgo: number = 30): Date => {
  const now = new Date();
  const msAgo = daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - Math.random() * msAgo);
};