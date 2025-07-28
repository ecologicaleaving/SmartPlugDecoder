import { EventEmitter } from 'events';
import { Client as SSDPClient } from 'node-ssdp';
import logger from '@/utils/logger';
import {
  DiscoveredDevice,
  DeviceProtocol,
  DeviceType,
  DiscoveryRequest,
  DeviceCapabilities,
} from '@/types';

export class NetworkScanner extends EventEmitter {
  private ssdpClient: SSDPClient;
  private scanTimeout: number = 10000; // 10 seconds default
  private isScanning: boolean = false;
  private discoveredDevices: Map<string, DiscoveredDevice> = new Map();

  constructor() {
    super();
    this.ssdpClient = new SSDPClient();
    this.setupSSDPListeners();
  }

  private setupSSDPListeners(): void {
    this.ssdpClient.on('response', (headers, statusCode, rinfo) => {
      try {
        const device = this.parseUPnPDevice(headers, rinfo);
        if (device) {
          this.addDiscoveredDevice(device);
        }
      } catch (error) {
        logger.warn(`Failed to parse UPnP device: ${error}`);
      }
    });

    this.ssdpClient.on('error', (error) => {
      logger.error(`SSDP Client error: ${error}`);
      this.emit('error', error);
    });
  }

  private parseUPnPDevice(headers: any, rinfo: any): DiscoveredDevice | null {
    const location = headers.LOCATION || headers.location;
    const usn = headers.USN || headers.usn;
    const server = headers.SERVER || headers.server;

    if (!location || !rinfo.address) {
      return null;
    }

    // Check if this looks like a smart plug or IoT device
    const deviceInfo = this.analyzeUPnPDevice(headers, server);
    if (!deviceInfo.isSmartDevice) {
      return null;
    }

    const deviceId = this.generateDeviceId(rinfo.address, usn);
    
    return {
      id: deviceId,
      name: deviceInfo.name || `UPnP Device (${rinfo.address})`,
      ipAddress: rinfo.address,
      deviceType: deviceInfo.deviceType,
      protocol: DeviceProtocol.UPNP,
      manufacturer: deviceInfo.manufacturer,
      model: deviceInfo.model,
      isSupported: deviceInfo.isSupported,
      capabilities: deviceInfo.capabilities,
      rawData: {
        headers,
        location,
        usn,
        server,
        port: rinfo.port,
      },
    };
  }

  private analyzeUPnPDevice(headers: any, server?: string): {
    isSmartDevice: boolean;
    name?: string;
    manufacturer?: string;
    model?: string;
    deviceType: DeviceType;
    isSupported: boolean;
    capabilities: Partial<DeviceCapabilities>;
  } {
    const st = headers.ST || headers.st || '';
    const usn = headers.USN || headers.usn || '';
    const serverLower = (server || '').toLowerCase();

    // Known smart plug patterns
    const smartPlugPatterns = [
      'smart',
      'plug',
      'switch',
      'outlet',
      'power',
      'energy',
      'tuya',
      'gosund',
      'kasa',
      'tp-link',
      'xiaomi',
      'shelly',
      'tasmota',
    ];

    const isSmartDevice = smartPlugPatterns.some(pattern => 
      serverLower.includes(pattern) || 
      st.toLowerCase().includes(pattern) ||
      usn.toLowerCase().includes(pattern)
    );

    // Extract manufacturer info
    let manufacturer = 'Unknown';
    let model: string | undefined;
    let isSupported = false;
    let deviceType = DeviceType.UNKNOWN;

    if (serverLower.includes('tuya')) {
      manufacturer = 'Tuya';
      isSupported = true;
      deviceType = DeviceType.SMART_PLUG;
    } else if (serverLower.includes('kasa') || serverLower.includes('tp-link')) {
      manufacturer = 'TP-Link';
      model = 'Kasa';
      isSupported = true;
      deviceType = DeviceType.SMART_PLUG;
    } else if (serverLower.includes('gosund')) {
      manufacturer = 'Gosund';
      isSupported = true;
      deviceType = DeviceType.SMART_PLUG;
    } else if (serverLower.includes('shelly')) {
      manufacturer = 'Shelly';
      isSupported = true;
      deviceType = DeviceType.SMART_PLUG;
    } else if (serverLower.includes('tasmota')) {
      manufacturer = 'Tasmota';
      isSupported = true;
      deviceType = DeviceType.SMART_PLUG;
    } else if (isSmartDevice) {
      deviceType = DeviceType.SMART_PLUG;
      isSupported = false; // Unknown but potentially supportable
    }

    const capabilities: Partial<DeviceCapabilities> = {
      hasPowerMonitoring: isSupported,
      hasScheduling: isSupported,
      hasDimming: false,
      hasEnergyMeter: isSupported,
      supportedCommands: isSupported ? ['power_on', 'power_off', 'get_status'] : [],
    };

    return {
      isSmartDevice,
      manufacturer,
      model,
      deviceType,
      isSupported,
      capabilities,
    };
  }

  private generateDeviceId(ipAddress: string, usn?: string): string {
    const base = usn || ipAddress;
    return Buffer.from(base).toString('base64').substring(0, 16);
  }

  private addDiscoveredDevice(device: DiscoveredDevice): void {
    const existingDevice = this.discoveredDevices.get(device.id);
    
    if (!existingDevice) {
      this.discoveredDevices.set(device.id, device);
      logger.info(`Discovered new device: ${device.name} (${device.ipAddress})`);
      this.emit('deviceDiscovered', device);
    }
  }

  public async scanNetwork(request: DiscoveryRequest = {}): Promise<DiscoveredDevice[]> {
    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    const {
      protocols = [DeviceProtocol.UPNP],
      timeout = this.scanTimeout,
      includeOffline = false,
    } = request;

    this.isScanning = true;
    this.discoveredDevices.clear();

    logger.info(`Starting network scan (timeout: ${timeout}ms, protocols: ${protocols.join(', ')})`);

    try {
      const scanPromises: Promise<void>[] = [];

      // UPnP/SSDP scan
      if (protocols.includes(DeviceProtocol.UPNP)) {
        scanPromises.push(this.scanUPnP(timeout));
      }

      // Future: Add other protocol scans here
      if (protocols.includes(DeviceProtocol.TUYA)) {
        scanPromises.push(this.scanTuya(timeout));
      }

      // Wait for all scans to complete
      await Promise.allSettled(scanPromises);

      const devices = Array.from(this.discoveredDevices.values());
      logger.info(`Network scan completed. Found ${devices.length} devices.`);

      return devices;
    } catch (error) {
      logger.error(`Network scan failed: ${error}`);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  private async scanUPnP(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.ssdpClient.stop();
        resolve();
      }, timeout);

      try {
        // Search for UPnP devices
        this.ssdpClient.search('upnp:rootdevice');
        this.ssdpClient.search('ssdp:all');
        
        // Also search for specific device types
        this.ssdpClient.search('urn:schemas-upnp-org:device:Basic:1');
        this.ssdpClient.search('urn:schemas-upnp-org:device:BinaryLight:1');
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  private async scanTuya(timeout: number): Promise<void> {
    // TODO: Implement Tuya local device discovery
    // This would require UDP broadcast to find Tuya devices on the network
    logger.info('Tuya local discovery not yet implemented');
    return Promise.resolve();
  }

  public stopScan(): void {
    if (this.isScanning) {
      this.ssdpClient.stop();
      this.isScanning = false;
      logger.info('Network scan stopped');
    }
  }

  public getDiscoveredDevices(): DiscoveredDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  public clearDiscoveredDevices(): void {
    this.discoveredDevices.clear();
  }

  public destroy(): void {
    this.stopScan();
    this.removeAllListeners();
    this.discoveredDevices.clear();
  }
}

export default NetworkScanner;