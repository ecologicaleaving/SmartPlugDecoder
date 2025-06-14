export interface DiscoveredDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  type: string;
  protocol: 'upnp' | 'mdns' | 'tuya' | 'unknown';
  manufacturer: string;
  model?: string;
  version?: string;
  capabilities: DeviceCapabilities;
  isSupported: boolean;
  lastSeen: Date;
}

export interface DeviceCapabilities {
  hasPowerControl: boolean;
  hasPowerMonitoring: boolean;
  hasScheduling: boolean;
  hasDimming: boolean;
  hasEnergyMeter: boolean;
  maxPower: number;
  supportedCommands: string[];
}

export interface ConnectedDevice extends DiscoveredDevice {
  isOnline: boolean;
  isOn: boolean;
  powerReading?: PowerReading;
  lastUpdate: Date;
  connectionAttempts: number;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

export interface PowerReading {
  power: number;        // Current power consumption in watts
  voltage: number;      // Voltage in volts
  current: number;      // Current in amperes
  energy: number;       // Total energy consumed in kWh
  timestamp: Date;
}

export interface DeviceControlCommand {
  deviceId: string;
  command: 'turn_on' | 'turn_off' | 'toggle' | 'get_status';
  parameters?: Record<string, any>;
}

export interface DeviceControlResponse {
  success: boolean;
  deviceId: string;
  command: string;
  newState?: {
    isOn: boolean;
    powerReading?: PowerReading;
  };
  error?: string;
  timestamp: Date;
}

export interface DiscoveryOptions {
  timeout?: number;
  protocols?: string[];
  localNetworkOnly?: boolean;
  includeUnsupported?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface WebSocketMessage {
  type: 'device_update' | 'device_discovered' | 'device_connected' | 'device_disconnected' | 'power_update';
  payload: any;
  timestamp: Date;
}