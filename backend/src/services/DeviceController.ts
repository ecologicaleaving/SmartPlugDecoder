import { EventEmitter } from 'events';
import { 
  DiscoveredDevice, 
  ConnectedDevice, 
  DeviceControlCommand, 
  DeviceControlResponse, 
  PowerReading 
} from '../types';
import { logger } from '../utils/logger';

export class DeviceController extends EventEmitter {
  private deviceConnections = new Map<string, any>();
  private connectionTimeouts = new Map<string, NodeJS.Timeout>();

  constructor() {
    super();
  }

  async connectDevice(discoveredDevice: DiscoveredDevice, config: any = {}): Promise<ConnectedDevice> {
    logger.info(`Connecting to device: ${discoveredDevice.name} (${discoveredDevice.protocol})`);

    // Simulate connection process
    await this.simulateConnectionDelay();

    // For now, we'll create a mock connected device
    // In a real implementation, this would establish actual protocol connections
    const connectedDevice: ConnectedDevice = {
      ...discoveredDevice,
      isOnline: true,
      isOn: false,
      powerReading: this.generateMockPowerReading(false),
      lastUpdate: new Date(),
      connectionAttempts: 1,
      connectionStatus: 'connected'
    };

    // Store connection info
    this.deviceConnections.set(discoveredDevice.id, {
      device: connectedDevice,
      protocol: discoveredDevice.protocol,
      config,
      lastHeartbeat: new Date()
    });

    // Start heartbeat monitoring
    this.startHeartbeat(discoveredDevice.id);

    this.emit('deviceConnected', connectedDevice);
    return connectedDevice;
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    logger.info(`Disconnecting device: ${deviceId}`);

    const connection = this.deviceConnections.get(deviceId);
    if (!connection) {
      throw new Error(`Device ${deviceId} not connected`);
    }

    // Clear heartbeat
    this.stopHeartbeat(deviceId);

    // Remove connection
    this.deviceConnections.delete(deviceId);

    this.emit('deviceDisconnected', deviceId);
  }

  async sendCommand(command: DeviceControlCommand): Promise<DeviceControlResponse> {
    logger.debug(`Sending command to device ${command.deviceId}: ${command.command}`);

    const connection = this.deviceConnections.get(command.deviceId);
    if (!connection) {
      throw new Error(`Device ${command.deviceId} not connected`);
    }

    const device = connection.device as ConnectedDevice;

    try {
      // Simulate command processing delay
      await this.simulateCommandDelay();

      // Process different command types
      let newState: any = undefined;

      switch (command.command) {
        case 'turn_on':
          device.isOn = true;
          newState = {
            isOn: true,
            powerReading: this.generateMockPowerReading(true)
          };
          break;

        case 'turn_off':
          device.isOn = false;
          newState = {
            isOn: false,
            powerReading: this.generateMockPowerReading(false)
          };
          break;

        case 'toggle':
          device.isOn = !device.isOn;
          newState = {
            isOn: device.isOn,
            powerReading: this.generateMockPowerReading(device.isOn)
          };
          break;

        case 'get_status':
          newState = {
            isOn: device.isOn,
            powerReading: device.powerReading
          };
          break;

        default:
          throw new Error(`Unsupported command: ${command.command}`);
      }

      // Update device state if we have new state
      if (newState) {
        device.powerReading = newState.powerReading;
        device.lastUpdate = new Date();
        connection.lastHeartbeat = new Date();
      }

      const response: DeviceControlResponse = {
        success: true,
        deviceId: command.deviceId,
        command: command.command,
        newState,
        timestamp: new Date()
      };

      // Emit update event
      this.emit('deviceUpdate', command.deviceId, { 
        isOn: device.isOn, 
        powerReading: device.powerReading 
      });

      return response;

    } catch (error) {
      logger.error(`Command failed for device ${command.deviceId}:`, error);
      
      return {
        success: false,
        deviceId: command.deviceId,
        command: command.command,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  async updatePowerReading(deviceId: string): Promise<void> {
    const connection = this.deviceConnections.get(deviceId);
    if (!connection) {
      return;
    }

    const device = connection.device as ConnectedDevice;
    
    if (device.capabilities.hasPowerMonitoring) {
      // Simulate getting fresh power reading
      const powerReading = this.generateMockPowerReading(device.isOn);
      device.powerReading = powerReading;
      device.lastUpdate = new Date();
      
      this.emit('powerUpdate', deviceId, powerReading);
    }
  }

  private async simulateConnectionDelay(): Promise<void> {
    // Simulate realistic connection time
    const delay = 1000 + Math.random() * 2000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async simulateCommandDelay(): Promise<void> {
    // Simulate realistic command response time
    const delay = 200 + Math.random() * 500; // 200-700ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateMockPowerReading(isOn: boolean): PowerReading {
    if (!isOn) {
      return {
        power: 0,
        voltage: 230,
        current: 0,
        energy: Math.random() * 10, // Random accumulated energy
        timestamp: new Date()
      };
    }

    // Generate realistic power consumption values
    const basePower = 50 + Math.random() * 100; // 50-150W base
    const variation = (Math.random() - 0.5) * 20; // ±10W variation
    const power = Math.max(0, basePower + variation);
    
    const voltage = 220 + Math.random() * 20; // 220-240V
    const current = power / voltage;
    
    return {
      power: Math.round(power * 10) / 10,
      voltage: Math.round(voltage * 10) / 10,
      current: Math.round(current * 100) / 100,
      energy: Math.random() * 10,
      timestamp: new Date()
    };
  }

  private startHeartbeat(deviceId: string): void {
    // Send periodic heartbeat to check device connectivity
    const heartbeatInterval = setInterval(async () => {
      try {
        await this.sendCommand({
          deviceId,
          command: 'get_status'
        });
      } catch (error) {
        logger.warn(`Heartbeat failed for device ${deviceId}:`, error);
        
        // Mark device as potentially offline after failed heartbeat
        const connection = this.deviceConnections.get(deviceId);
        if (connection) {
          const device = connection.device as ConnectedDevice;
          device.connectionAttempts += 1;
          
          if (device.connectionAttempts > 3) {
            device.isOnline = false;
            device.connectionStatus = 'error';
            this.emit('deviceUpdate', deviceId, { 
              isOnline: false, 
              connectionStatus: 'error' 
            });
          }
        }
      }
    }, 30000); // Every 30 seconds

    this.connectionTimeouts.set(deviceId, heartbeatInterval);
  }

  private stopHeartbeat(deviceId: string): void {
    const timeout = this.connectionTimeouts.get(deviceId);
    if (timeout) {
      clearInterval(timeout);
      this.connectionTimeouts.delete(deviceId);
    }
  }

  getDeviceConnection(deviceId: string): any {
    return this.deviceConnections.get(deviceId);
  }

  isDeviceConnected(deviceId: string): boolean {
    return this.deviceConnections.has(deviceId);
  }
}