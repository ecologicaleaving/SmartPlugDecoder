export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  version: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // for validation errors
  stack?: string; // only in development
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// Device API types
export interface DeviceListResponse extends ApiResponse<PaginatedResponse<SmartPlug>> {}

export interface DeviceControlRequest {
  action: DeviceAction;
  value?: any; // for dimming, scheduling, etc.
  scheduleId?: string;
}

export interface DeviceControlResponse extends ApiResponse<{
  deviceId: string;
  action: DeviceAction;
  success: boolean;
  newState: any;
  timestamp: string;
}> {}

export interface DeviceDiscoveryRequest {
  protocols?: Protocol[];
  timeout?: number;
  forceRescan?: boolean;
}

export interface DeviceDiscoveryResponse extends ApiResponse<DeviceDiscoveryResult[]> {}

export interface DeviceUpdateRequest {
  name?: string;
  room?: string;
  settings?: Record<string, any>;
}

// Energy API types
export interface EnergyDataRequest {
  deviceIds?: string[];
  startDate: string;
  endDate: string;
  granularity: TimePeriod;
  includeForecasts?: boolean;
}

export interface EnergyDataResponse extends ApiResponse<{
  period: {
    start: string;
    end: string;
    granularity: TimePeriod;
  };
  deviceData: Record<string, EnergyConsumption[]>;
  aggregated: EnergyConsumption[];
  analytics: EnergyAnalytics[];
}> {}

export interface CostAnalysisRequest {
  deviceIds?: string[];
  period: TimePeriod;
  startDate: string;
  endDate?: string;
  includeProjections?: boolean;
}

export interface CostAnalysisResponse extends ApiResponse<CostAnalysis> {}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  data: T;
  timestamp: string;
  id?: string;
}

export interface DeviceStatusUpdate {
  deviceId: string;
  status: DeviceStatus;
  powerReading?: PowerReading;
}

export interface RealTimeEnergyUpdate {
  timestamp: string;
  data: RealTimeEnergyData;
}

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  deviceId?: string;
  priority: NotificationPriority;
  actionRequired: boolean;
  metadata?: Record<string, any>;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse extends ApiResponse<{
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
  subscription: SubscriptionInfo;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserPreferences {
  currency: string;
  timezone: string;
  units: UnitSystem;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  deviceOffline: boolean;
  highEnergyUsage: boolean;
  costThresholds: boolean;
  systemUpdates: boolean;
}

export interface DashboardSettings {
  layout: 'grid' | 'list';
  theme: 'light' | 'dark' | 'auto';
  defaultTimeRange: TimePeriod;
  refreshInterval: number; // in seconds
  favoriteDevices: string[];
}

export interface SubscriptionInfo {
  plan: string;
  status: SubscriptionStatus;
  billingCycle: string;
  nextBillingDate: string;
  features: string[];
}

// Enums
export enum WebSocketMessageType {
  DEVICE_STATUS_UPDATE = 'device_status_update',
  REAL_TIME_ENERGY = 'real_time_energy',
  SYSTEM_NOTIFICATION = 'system_notification',
  CONNECTION_STATUS = 'connection_status',
  ERROR = 'error',
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  DEVICE_ALERT = 'device_alert',
  ENERGY_ALERT = 'energy_alert',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

// Utility types for better TypeScript experience
export type ApiEndpoint = 
  | '/api/devices'
  | '/api/devices/discover'
  | '/api/devices/:id'
  | '/api/devices/:id/control'
  | '/api/energy/consumption'
  | '/api/energy/cost-analysis'
  | '/api/energy/real-time'
  | '/api/auth/login'
  | '/api/auth/refresh'
  | '/api/user/profile'
  | '/api/user/preferences';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRoute {
  method: HttpMethod;
  endpoint: ApiEndpoint;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

// Type-only imports to avoid circular dependencies
export type { 
  SmartPlug, 
  DeviceAction, 
  Protocol, 
  DeviceDiscoveryResult, 
  DeviceStatus, 
  PowerReading 
} from './Device';
export type { 
  EnergyConsumption, 
  EnergyAnalytics, 
  CostAnalysis, 
  TimePeriod, 
  RealTimeEnergyData 
} from './Energy';