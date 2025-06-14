import { EventEmitter } from 'events';
import dgram from 'dgram';
import { DiscoveredDevice, DiscoveryOptions, DeviceCapabilities } from '../types';
import { logger } from '../utils/logger';

export class NetworkScanner extends EventEmitter {
  private isScanning = false;
  private scanTimeout?: NodeJS.Timeout;
  private discoveredDevices = new Map<string, DiscoveredDevice>();

  constructor() {
    super();
    this.setMaxListeners(50); // Increase listener limit for multiple scans
  }

  async startScan(options: DiscoveryOptions = {}): Promise<DiscoveredDevice[]> {
    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    const {
      timeout = 5000,
      protocols = ['upnp', 'mdns'],
      localNetworkOnly = true,
      includeUnsupported = false
    } = options;

    logger.info('Starting network device scan', { timeout, protocols, localNetworkOnly });
    
    this.isScanning = true;
    this.discoveredDevices.clear();
    this.emit('scanStarted');

    try {
      // Start different discovery protocols in parallel
      const scanPromises: Promise<void>[] = [];

      if (protocols.includes('upnp')) {
        scanPromises.push(this.scanUPnP(timeout));
      }

      if (protocols.includes('mdns')) {
        scanPromises.push(this.scanMDNS(timeout));
      }

      // Add simulated devices for development
      if (process.env.NODE_ENV === 'development') {
        scanPromises.push(this.addMockDevices());
      }

      // Wait for all scans to complete or timeout
      await Promise.allSettled(scanPromises);

      // Filter results based on options
      const devices = Array.from(this.discoveredDevices.values());
      const filteredDevices = includeUnsupported 
        ? devices 
        : devices.filter(d => d.isSupported);

      logger.info(`Network scan completed. Found ${devices.length} devices (${filteredDevices.length} supported)`);
      this.emit('scanCompleted', filteredDevices);

      return filteredDevices;

    } catch (error) {
      logger.error('Network scan failed:', error);
      this.emit('scanError', error);
      throw error;
    } finally {
      this.isScanning = false;
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
    }
  }

  private async scanUPnP(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      logger.debug('Starting UPnP/SSDP discovery');
      
      const socket = dgram.createSocket('udp4');
      const multicastAddress = '239.255.255.250';
      const multicastPort = 1900;
      
      // UPnP search message
      const searchMessage = [
        'M-SEARCH * HTTP/1.1',
        'HOST: 239.255.255.250:1900',
        'MAN: "ssdp:discover"',
        'ST: upnp:rootdevice',
        'MX: 3',
        '',
        ''
      ].join('\r\n');

      socket.on('message', (msg, rinfo) => {
        this.parseUPnPResponse(msg.toString(), rinfo.address);
      });

      socket.on('error', (err) => {
        logger.error('UPnP socket error:', err);
      });

      // Send UPnP discovery message
      socket.send(searchMessage, multicastPort, multicastAddress, (err) => {
        if (err) {
          logger.error('Failed to send UPnP discovery message:', err);
        } else {
          logger.debug('UPnP discovery message sent');
        }
      });

      // Stop UPnP scan after timeout
      setTimeout(() => {
        socket.close();
        resolve();
      }, timeout);
    });
  }

  private async scanMDNS(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      logger.debug('Starting mDNS discovery');
      
      // Simulate mDNS discovery for now
      // In a real implementation, we would use a library like 'bonjour-service'
      
      setTimeout(() => {
        // Add mock mDNS devices
        this.addDevice({
          id: 'mdns-device-1',
          name: 'Smart Plug mDNS',
          ip: '192.168.1.105',
          port: 80,
          type: 'Smart Plug',
          protocol: 'mdns',
          manufacturer: 'Generic',
          model: 'mDNS-SP1',
          capabilities: this.getDefaultCapabilities(),
          isSupported: true,
          lastSeen: new Date()
        });
        
        resolve();
      }, 1000);
    });
  }

  private async addMockDevices(): Promise<void> {
    logger.debug('Adding mock devices for development');
    
    const mockDevices: Omit<DiscoveredDevice, 'lastSeen'>[] = [
      {
        id: 'mock-tuya-1',
        name: 'Tuya Smart Plug',
        ip: '192.168.1.101',
        port: 6668,
        type: 'Smart Plug',
        protocol: 'tuya',
        manufacturer: 'Gosund',
        model: 'SP1',
        capabilities: {
          hasPowerControl: true,
          hasPowerMonitoring: true,
          hasScheduling: true,
          hasDimming: false,
          hasEnergyMeter: true,
          maxPower: 3500,
          supportedCommands: ['turn_on', 'turn_off', 'get_status', 'get_power']
        },
        isSupported: true
      },
      {
        id: 'mock-upnp-1',
        name: 'TP-Link Kasa',
        ip: '192.168.1.102',
        port: 9999,
        type: 'Smart Plug',
        protocol: 'upnp',
        manufacturer: 'TP-Link',
        model: 'HS110',
        capabilities: {
          hasPowerControl: true,
          hasPowerMonitoring: true,
          hasScheduling: true,
          hasDimming: false,
          hasEnergyMeter: true,
          maxPower: 2200,
          supportedCommands: ['turn_on', 'turn_off', 'get_status', 'get_power']
        },
        isSupported: true
      },
      {
        id: 'mock-unknown-1',
        name: 'Unknown Device',
        ip: '192.168.1.103',
        port: 80,
        type: 'Unknown',
        protocol: 'unknown',
        manufacturer: 'Unknown',
        capabilities: this.getDefaultCapabilities(),
        isSupported: false
      }
    ];

    // Add devices with staggered timing to simulate real discovery
    for (let i = 0; i < mockDevices.length; i++) {
      setTimeout(() => {
        this.addDevice({
          ...mockDevices[i],
          lastSeen: new Date()
        });
      }, i * 800);
    }
  }

  private parseUPnPResponse(response: string, ip: string): void {
    // Basic UPnP response parsing
    const lines = response.split('\r\n');
    const headers: Record<string, string> = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).toLowerCase().trim();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }

    // Check if this might be a smart plug
    const server = headers['server'] || '';
    const location = headers['location'] || '';
    
    if (this.isLikelySmartPlug(server, location)) {
      const device: DiscoveredDevice = {
        id: `upnp-${ip}`,
        name: this.extractDeviceName(server) || 'UPnP Device',
        ip,
        port: this.extractPortFromLocation(location) || 80,
        type: 'Smart Plug',
        protocol: 'upnp',
        manufacturer: this.extractManufacturer(server) || 'Unknown',
        capabilities: this.getDefaultCapabilities(),
        isSupported: true,
        lastSeen: new Date()
      };

      this.addDevice(device);
    }
  }

  private isLikelySmartPlug(server: string, location: string): boolean {
    const smartPlugIndicators = [
      'plug', 'switch', 'outlet', 'power', 'energy',
      'kasa', 'tuya', 'smartlife', 'gosund', 'teckin',
      'upnp/1.0', 'rootdevice'
    ];
    
    const text = `${server} ${location}`.toLowerCase();
    return smartPlugIndicators.some(indicator => text.includes(indicator));
  }

  private extractDeviceName(server: string): string | null {
    // Extract device name from server string
    const match = server.match(/^([^\/]+)/);
    return match ? match[1].trim() : null;
  }

  private extractManufacturer(server: string): string | null {
    // Extract manufacturer from server string
    const manufacturers = ['tp-link', 'kasa', 'tuya', 'gosund', 'teckin', 'amazon'];
    const serverLower = server.toLowerCase();
    
    for (const manufacturer of manufacturers) {
      if (serverLower.includes(manufacturer)) {
        return manufacturer.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join('-');
      }
    }
    
    return null;
  }

  private extractPortFromLocation(location: string): number | null {
    try {
      const url = new URL(location);
      return parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
    } catch {
      return null;
    }
  }

  private getDefaultCapabilities(): DeviceCapabilities {
    return {
      hasPowerControl: true,
      hasPowerMonitoring: false,
      hasScheduling: false,
      hasDimming: false,
      hasEnergyMeter: false,
      maxPower: 1000,
      supportedCommands: ['turn_on', 'turn_off', 'get_status']
    };
  }

  private addDevice(device: DiscoveredDevice): void {
    // Avoid duplicates based on IP address
    const existingDevice = Array.from(this.discoveredDevices.values())
      .find(d => d.ip === device.ip);
    
    if (!existingDevice) {
      this.discoveredDevices.set(device.id, device);
      logger.debug(`Discovered device: ${device.name} (${device.ip}) - ${device.protocol}`);
      this.emit('deviceDiscovered', device);
    } else {
      // Update last seen time for existing device
      existingDevice.lastSeen = new Date();
    }
  }

  stopScan(): void {
    if (this.isScanning) {
      logger.info('Stopping network scan');
      this.isScanning = false;
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
      this.emit('scanStopped');
    }
  }

  getDiscoveredDevices(): DiscoveredDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  clearDiscoveredDevices(): void {
    this.discoveredDevices.clear();
    this.emit('devicesCleared');
  }
}