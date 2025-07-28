// Core device types
export interface Device {
  id: string;
  userId: string;
  name: string;
  room?: string;
  deviceType: string;
  protocol: DeviceProtocol;
  macAddress?: string;
  ipAddress?: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  isOnline: boolean;
  isEnabled: boolean;
  lastSeen?: Date;
  capabilities: DeviceCapabilities;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceCapabilities {
  hasPowerMonitoring: boolean;
  hasScheduling: boolean;
  hasDimming: boolean;
  hasEnergyMeter: boolean;
  maxPower?: number;
  supportedCommands: string[];
}

export enum DeviceProtocol {
  TUYA = 'tuya',
  UPNP = 'upnp',
  ZIGBEE = 'zigbee',
  ZWAVE = 'zwave',
  MATTER = 'matter',
  WIFI = 'wifi',
  UNKNOWN = 'unknown'
}

export enum DeviceType {
  SMART_PLUG = 'smart_plug',
  SMART_SWITCH = 'smart_switch',
  ENERGY_METER = 'energy_meter',
  DIMMER = 'dimmer',
  UNKNOWN = 'unknown'
}

// Device discovery types
export interface DiscoveredDevice {
  id: string;
  name: string;
  ipAddress: string;
  macAddress?: string;
  deviceType: DeviceType;
  protocol: DeviceProtocol;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  isSupported: boolean;
  capabilities: Partial<DeviceCapabilities>;
  rawData?: any; // Protocol-specific data
}

export interface DeviceStatus {
  deviceId: string;
  isOnline: boolean;
  powerState: boolean;
  powerReading?: PowerReading;
  lastUpdate: Date;
  errorMessage?: string;
}

export interface PowerReading {
  power: number; // Current power in watts
  voltage: number; // Voltage in volts
  current: number; // Current in amperes
  energy: number; // Cumulative energy in kWh
  timestamp: Date;
}

// Device control types
export interface DeviceCommand {
  type: DeviceCommandType;
  value?: any;
  timestamp: Date;
}

export enum DeviceCommandType {
  POWER_ON = 'power_on',
  POWER_OFF = 'power_off',
  TOGGLE = 'toggle',
  SET_BRIGHTNESS = 'set_brightness',
  GET_STATUS = 'get_status',
  GET_POWER = 'get_power'
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Device discovery request/response types
export interface DiscoveryRequest {
  protocols?: DeviceProtocol[];
  timeout?: number; // in milliseconds
  includeOffline?: boolean;
}

export interface DiscoveryResponse extends ApiResponse<DiscoveredDevice[]> {
  scanDuration: number;
  devicesFound: number;
}

// Device control request/response types
export interface DeviceControlRequest {
  command: DeviceCommand;
}

export interface DeviceControlResponse extends ApiResponse<DeviceStatus> {
  executionTime: number;
}

// Error types
export interface DeviceError {
  code: string;
  message: string;
  deviceId?: string;
  timestamp: Date;
  details?: any;
}

export enum ErrorCode {
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  COMMAND_FAILED = 'COMMAND_FAILED',
  PROTOCOL_ERROR = 'PROTOCOL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Service interfaces
export interface DeviceController {
  discover(request: DiscoveryRequest): Promise<DiscoveredDevice[]>;
  connect(device: DiscoveredDevice): Promise<Device>;
  control(deviceId: string, command: DeviceCommand): Promise<DeviceStatus>;
  getStatus(deviceId: string): Promise<DeviceStatus>;
  disconnect(deviceId: string): Promise<void>;
  subscribe(deviceId: string, callback: (status: DeviceStatus) => void): void;
  unsubscribe(deviceId: string): void;
}

// WebSocket event types
export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: Date;
}

export enum WebSocketEventType {
  DEVICE_STATUS_UPDATE = 'device_status_update',
  DEVICE_DISCOVERED = 'device_discovered',
  DEVICE_CONNECTED = 'device_connected',
  DEVICE_DISCONNECTED = 'device_disconnected',
  POWER_READING_UPDATE = 'power_reading_update',
  ERROR = 'error'
}

// Configuration types
export interface AppConfig {
  port: number;
  database: {
    url: string;
    maxConnections: number;
  };
  redis: {
    url: string;
    maxRetries: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  device: {
    discoveryTimeout: number;
    commandTimeout: number;
    maxDevicesPerUser: number;
  };
  logging: {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
  };
}

// User and authentication types (simplified for now)
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse extends ApiResponse {
  user?: User;
  token?: string;
  expiresIn?: number;
}