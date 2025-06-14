import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import { NetworkScanner } from './NetworkScanner';
import { DeviceController } from './DeviceController';
import { 
  DiscoveredDevice, 
  ConnectedDevice, 
  DeviceControlCommand, 
  DeviceControlResponse,
  PowerReading,
  WebSocketMessage 
} from '../types';
import { logger } from '../utils/logger';

export class DeviceManager extends EventEmitter {
  private networkScanner: NetworkScanner;
  private deviceController: DeviceController;
  private connectedDevices = new Map<string, ConnectedDevice>();
  private discoveryInterval?: NodeJS.Timeout;
  private powerMonitoringInterval?: NodeJS.Timeout;
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.networkScanner = new NetworkScanner();
    this.deviceController = new DeviceController();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Network scanner events
    this.networkScanner.on('deviceDiscovered', (device: DiscoveredDevice) => {
      this.broadcastMessage({
        type: 'device_discovered',
        payload: device,
        timestamp: new Date()
      });
    });

    // Device controller events
    this.deviceController.on('deviceConnected', (device: ConnectedDevice) => {
      this.connectedDevices.set(device.id, device);
      this.broadcastMessage({
        type: 'device_connected',
        payload: device,
        timestamp: new Date()
      });
    });

    this.deviceController.on('deviceDisconnected', (deviceId: string) => {
      const device = this.connectedDevices.get(deviceId);
      if (device) {
        device.connectionStatus = 'disconnected';
        device.isOnline = false;
        this.broadcastMessage({
          type: 'device_disconnected',
          payload: { deviceId, device },
          timestamp: new Date()
        });
      }
    });

    this.deviceController.on('powerUpdate', (deviceId: string, powerReading: PowerReading) => {
      const device = this.connectedDevices.get(deviceId);
      if (device) {
        device.powerReading = powerReading;
        device.lastUpdate = new Date();
        this.broadcastMessage({
          type: 'power_update',
          payload: { deviceId, powerReading },
          timestamp: new Date()
        });
      }
    });

    this.deviceController.on('deviceUpdate', (deviceId: string, updates: Partial<ConnectedDevice>) => {
      const device = this.connectedDevices.get(deviceId);
      if (device) {
        Object.assign(device, updates);
        device.lastUpdate = new Date();
        this.broadcastMessage({
          type: 'device_update',
          payload: { deviceId, device, updates },
          timestamp: new Date()
        });
      }
    });
  }

  private broadcastMessage(message: WebSocketMessage): void {
    this.io.emit('message', message);
    logger.debug(`Broadcasting message: ${message.type}`, { payload: message.payload });
  }

  async startDiscovery(options = {}): Promise<DiscoveredDevice[]> {
    logger.info('Starting device discovery');
    try {
      const devices = await this.networkScanner.startScan(options);
      logger.info(`Discovery completed. Found ${devices.length} devices`);
      return devices;
    } catch (error) {
      logger.error('Discovery failed:', error);
      throw error;
    }
  }

  stopDiscovery(): void {
    logger.info('Stopping device discovery');
    this.networkScanner.stopScan();
  }

  async connectDevice(discoveredDevice: DiscoveredDevice, config: any = {}): Promise<ConnectedDevice> {
    logger.info(`Attempting to connect device: ${discoveredDevice.name} (${discoveredDevice.ip})`);
    
    try {
      const connectedDevice = await this.deviceController.connectDevice(discoveredDevice, config);
      this.connectedDevices.set(connectedDevice.id, connectedDevice);
      
      logger.info(`Successfully connected device: ${connectedDevice.name}`);
      return connectedDevice;
    } catch (error) {
      logger.error(`Failed to connect device ${discoveredDevice.name}:`, error);
      throw error;
    }
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    logger.info(`Disconnecting device: ${deviceId}`);
    
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      await this.deviceController.disconnectDevice(deviceId);
      this.connectedDevices.delete(deviceId);
      logger.info(`Successfully disconnected device: ${deviceId}`);
    } catch (error) {
      logger.error(`Failed to disconnect device ${deviceId}:`, error);
      throw error;
    }
  }

  async controlDevice(command: DeviceControlCommand): Promise<DeviceControlResponse> {
    logger.debug(`Controlling device: ${command.deviceId} - ${command.command}`);
    
    const device = this.connectedDevices.get(command.deviceId);
    if (!device) {
      throw new Error(`Device ${command.deviceId} not found`);
    }

    if (!device.isOnline) {
      throw new Error(`Device ${command.deviceId} is offline`);
    }

    try {
      const response = await this.deviceController.sendCommand(command);
      
      // Update device state based on successful command
      if (response.success && response.newState) {
        const updates: Partial<ConnectedDevice> = {
          isOn: response.newState.isOn,
          powerReading: response.newState.powerReading,
          lastUpdate: new Date()
        };
        Object.assign(device, updates);
      }

      logger.debug(`Device control response: ${response.success ? 'success' : 'failed'}`);
      return response;
    } catch (error) {
      logger.error(`Device control failed for ${command.deviceId}:`, error);
      throw error;
    }
  }

  getConnectedDevices(): ConnectedDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  getConnectedDevice(deviceId: string): ConnectedDevice | undefined {
    return this.connectedDevices.get(deviceId);
  }

  getDiscoveredDevices(): DiscoveredDevice[] {
    return this.networkScanner.getDiscoveredDevices();
  }

  startDiscoveryService(): void {
    logger.info('Starting automatic discovery service');
    
    // Initial discovery
    this.startDiscovery().catch(error => {
      logger.error('Initial discovery failed:', error);
    });

    // Periodic discovery every 5 minutes
    this.discoveryInterval = setInterval(() => {
      this.startDiscovery().catch(error => {
        logger.error('Periodic discovery failed:', error);
      });
    }, 5 * 60 * 1000);

    // Start power monitoring for connected devices
    this.startPowerMonitoring();
  }

  private startPowerMonitoring(): void {
    logger.info('Starting power monitoring service');
    
    this.powerMonitoringInterval = setInterval(async () => {
      const connectedDevices = this.getConnectedDevices();
      
      for (const device of connectedDevices) {
        if (device.isOnline && device.capabilities.hasPowerMonitoring) {
          try {
            await this.deviceController.updatePowerReading(device.id);
          } catch (error) {
            logger.error(`Power monitoring failed for device ${device.id}:`, error);
          }
        }
      }
    }, 10000); // Update every 10 seconds
  }

  async refreshDeviceStatus(): Promise<void> {
    logger.debug('Refreshing device status for all connected devices');
    
    const devices = this.getConnectedDevices();
    const statusPromises = devices.map(async (device) => {
      try {
        await this.controlDevice({
          deviceId: device.id,
          command: 'get_status'
        });
      } catch (error) {
        logger.error(`Failed to refresh status for device ${device.id}:`, error);
        // Mark device as potentially offline
        device.isOnline = false;
        device.connectionStatus = 'error';
      }
    });

    await Promise.allSettled(statusPromises);
  }

  shutdown(): void {
    logger.info('Shutting down device manager');
    
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
    
    if (this.powerMonitoringInterval) {
      clearInterval(this.powerMonitoringInterval);
    }
    
    this.networkScanner.stopScan();
    
    // Disconnect all devices
    const disconnectPromises = Array.from(this.connectedDevices.keys()).map(deviceId => {
      return this.disconnectDevice(deviceId).catch(error => {
        logger.error(`Failed to disconnect device ${deviceId} during shutdown:`, error);
      });
    });
    
    Promise.allSettled(disconnectPromises).then(() => {
      logger.info('Device manager shutdown complete');
    });
  }
}