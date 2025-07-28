// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface DiscoveryResponse extends ApiResponse {
  data: DiscoveredDevice[];
  scanDuration: number;
  devicesFound: number;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  ipAddress: string;
  macAddress?: string;
  deviceType: string;
  protocol: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  isSupported: boolean;
  capabilities: {
    hasPowerMonitoring?: boolean;
    hasScheduling?: boolean;
    hasDimming?: boolean;
    hasEnergyMeter?: boolean;
    maxPower?: number;
    supportedCommands?: string[];
  };
  rawData?: any;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  room?: string;
  deviceType: string;
  protocol: string;
  macAddress?: string;
  ipAddress?: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  isOnline: boolean;
  isEnabled: boolean;
  lastSeen?: string;
  capabilities: {
    hasPowerMonitoring: boolean;
    hasScheduling: boolean;
    hasDimming: boolean;
    hasEnergyMeter: boolean;
    maxPower?: number;
    supportedCommands: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface DeviceStatus {
  deviceId: string;
  isOnline: boolean;
  powerState: boolean;
  powerReading?: {
    power: number;
    voltage: number;
    current: number;
    energy: number;
    timestamp: string;
  };
  lastUpdate: string;
  errorMessage?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public response?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    throw new ApiError(response.status, 'Invalid JSON response');
  }

  if (!response.ok) {
    throw new ApiError(
      response.status, 
      responseData.error || responseData.message || 'API request failed',
      responseData
    );
  }

  return responseData;
}

// Discovery API
export const discoveryApi = {
  // Start network device discovery
  async startScan(options: {
    protocols?: string[];
    timeout?: number;
    includeOffline?: boolean;
  } = {}): Promise<DiscoveryResponse> {
    return apiRequest<DiscoveryResponse>('/discovery/scan', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  // Get currently discovered devices
  async getDiscoveredDevices(): Promise<ApiResponse<DiscoveredDevice[]>> {
    return apiRequest<ApiResponse<DiscoveredDevice[]>>('/discovery/devices');
  },

  // Clear discovered devices cache
  async clearDiscoveredDevices(): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/discovery/devices', {
      method: 'DELETE',
    });
  },

  // Stop ongoing discovery scan
  async stopScan(): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/discovery/stop', {
      method: 'POST',
    });
  },

  // Get discovery service status
  async getStatus(): Promise<ApiResponse<{
    isScanning: boolean;
    devicesFound: number;
    supportedProtocols: string[];
    lastScanTime: string | null;
  }>> {
    return apiRequest('/discovery/status');
  },
};

// Device API
export const deviceApi = {
  // Get all user devices
  async getDevices(): Promise<ApiResponse<Device[]>> {
    return apiRequest<ApiResponse<Device[]>>('/devices');
  },

  // Get specific device
  async getDevice(id: string): Promise<ApiResponse<Device>> {
    return apiRequest<ApiResponse<Device>>(`/devices/${id}`);
  },

  // Add discovered device to user's device list
  async addDevice(data: {
    discoveredDevice: DiscoveredDevice;
    name: string;
    room?: string;
    notes?: string;
  }): Promise<ApiResponse<Device>> {
    return apiRequest<ApiResponse<Device>>('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update device settings
  async updateDevice(id: string, data: {
    name?: string;
    room?: string;
    isEnabled?: boolean;
  }): Promise<ApiResponse<Device>> {
    return apiRequest<ApiResponse<Device>>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Remove device
  async removeDevice(id: string): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(`/devices/${id}`, {
      method: 'DELETE',
    });
  },

  // Control device (turn on/off, etc.)
  async controlDevice(id: string, command: {
    type: 'power_on' | 'power_off' | 'toggle' | 'set_brightness' | 'get_status' | 'get_power';
    value?: any;
  }): Promise<ApiResponse<DeviceStatus>> {
    return apiRequest<ApiResponse<DeviceStatus>>(`/devices/${id}/control`, {
      method: 'POST',
      body: JSON.stringify({
        command: {
          ...command,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  },

  // Get device status
  async getDeviceStatus(id: string): Promise<ApiResponse<DeviceStatus>> {
    return apiRequest<ApiResponse<DeviceStatus>>(`/devices/${id}/status`);
  },
};

// Health API
export const healthApi = {
  // Get service health status
  async getHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    system: {
      platform: string;
      nodeVersion: string;
      arch: string;
    };
    services: {
      networkScanner: 'operational' | 'error';
    };
  }>> {
    return apiRequest('/health');
  },
};

export { ApiError };