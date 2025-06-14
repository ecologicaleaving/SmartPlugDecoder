export interface SmartPlug {
  id: string;
  name: string;
  room: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  ipAddress: string;
  macAddress: string;
  isOnline: boolean;
  isOn: boolean;
  lastSeen: Date;
  capabilities: DeviceCapabilities;
  powerReading?: PowerReading;
}

export interface DeviceCapabilities {
  hasPowerMonitoring: boolean;
  hasScheduling: boolean;
  hasDimming: boolean;
  hasEnergyMeter: boolean;
  maxPower: number; // in watts
  supportedProtocols: Protocol[];
}

export interface PowerReading {
  timestamp: Date;
  voltage: number; // in volts
  current: number; // in amperes
  power: number; // in watts
  frequency: number; // in hertz
  powerFactor: number;
  totalEnergy: number; // in kWh
}

export interface DeviceStatus {
  deviceId: string;
  isOnline: boolean;
  isOn: boolean;
  lastUpdate: Date;
  errorMessage?: string;
}

export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  deviceIds: string[];
  room?: string;
  isOn: boolean; // true if any device in group is on
  totalPower: number; // sum of all devices' power consumption
}

export interface DeviceSchedule {
  id: string;
  deviceId: string;
  name: string;
  isEnabled: boolean;
  scheduleType: ScheduleType;
  startTime: string; // HH:MM format
  endTime?: string; // HH:MM format
  days: DayOfWeek[];
  action: DeviceAction;
  createdAt: Date;
  updatedAt: Date;
}

export enum Protocol {
  WIFI = 'wifi',
  ZIGBEE = 'zigbee',
  ZWAVE = 'zwave',
  MATTER = 'matter',
  TUYA = 'tuya',
  UPNP = 'upnp',
}

export enum ScheduleType {
  TIME_BASED = 'time_based',
  SUNRISE_SUNSET = 'sunrise_sunset',
  ENERGY_PRICE = 'energy_price',
  SOLAR_GENERATION = 'solar_generation',
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export enum DeviceAction {
  TURN_ON = 'turn_on',
  TURN_OFF = 'turn_off',
  TOGGLE = 'toggle',
  DIM = 'dim',
}

export enum DeviceConnectionState {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export interface DeviceDiscoveryResult {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  ipAddress: string;
  macAddress: string;
  protocol: Protocol;
  capabilities: DeviceCapabilities;
  isSupported: boolean;
  requiresSetup: boolean;
}