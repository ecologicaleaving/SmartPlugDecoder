import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5174';

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock device data for testing
const mockDevices = [
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
    isSupported: true,
    lastSeen: new Date()
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
    isSupported: true,
    lastSeen: new Date()
  }
];

let connectedDevices: any[] = [];

// Discovery API
app.post('/api/discovery/scan', async (req, res) => {
  console.log('🔍 Discovery scan requested');
  
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  res.json({
    success: true,
    data: {
      devices: mockDevices,
      count: mockDevices.length,
      supportedCount: mockDevices.filter(d => d.isSupported).length
    },
    timestamp: new Date()
  });
});

app.get('/api/discovery/devices', (req, res) => {
  res.json({
    success: true,
    data: {
      devices: mockDevices,
      count: mockDevices.length
    },
    timestamp: new Date()
  });
});

// Device connection API
app.post('/api/devices/connect', async (req, res) => {
  const { discoveredDevice, config = {} } = req.body;
  
  if (!discoveredDevice) {
    return res.status(400).json({
      success: false,
      error: 'discoveredDevice is required',
      timestamp: new Date()
    });
  }

  console.log(`🔌 Connecting device: ${discoveredDevice.name}`);
  
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const connectedDevice = {
    ...discoveredDevice,
    isOnline: true,
    isOn: false,
    powerReading: {
      power: 0,
      voltage: 230,
      current: 0,
      energy: Math.random() * 10,
      timestamp: new Date()
    },
    lastUpdate: new Date(),
    connectionAttempts: 1,
    connectionStatus: 'connected'
  };
  
  connectedDevices.push(connectedDevice);
  
  res.json({
    success: true,
    data: connectedDevice,
    timestamp: new Date()
  });
});

// Device control API
app.post('/api/devices/:id/control', async (req, res) => {
  const deviceId = req.params.id;
  const { command } = req.body;
  
  console.log(`🎛️ Controlling device ${deviceId}: ${command}`);
  
  const device = connectedDevices.find(d => d.id === deviceId);
  if (!device) {
    return res.status(404).json({
      success: false,
      error: 'Device not found',
      timestamp: new Date()
    });
  }
  
  // Simulate command delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let newState: any = {};
  
  switch (command) {
    case 'turn_on':
      device.isOn = true;
      newState = {
        isOn: true,
        powerReading: {
          power: 75 + Math.random() * 50,
          voltage: 230,
          current: 0.35,
          energy: device.powerReading.energy,
          timestamp: new Date()
        }
      };
      break;
      
    case 'turn_off':
      device.isOn = false;
      newState = {
        isOn: false,
        powerReading: {
          power: 0,
          voltage: 230,
          current: 0,
          energy: device.powerReading.energy,
          timestamp: new Date()
        }
      };
      break;
      
    case 'toggle':
      device.isOn = !device.isOn;
      newState = {
        isOn: device.isOn,
        powerReading: device.isOn ? {
          power: 75 + Math.random() * 50,
          voltage: 230,
          current: 0.35,
          energy: device.powerReading.energy,
          timestamp: new Date()
        } : {
          power: 0,
          voltage: 230,
          current: 0,
          energy: device.powerReading.energy,
          timestamp: new Date()
        }
      };
      break;
  }
  
  // Update device
  device.powerReading = newState.powerReading;
  device.lastUpdate = new Date();
  
  res.json({
    success: true,
    data: {
      success: true,
      deviceId,
      command,
      newState,
      timestamp: new Date()
    },
    timestamp: new Date()
  });
});

// Get connected devices
app.get('/api/devices', (req, res) => {
  res.json({
    success: true,
    data: {
      devices: connectedDevices,
      count: connectedDevices.length,
      onlineCount: connectedDevices.filter(d => d.isOnline).length
    },
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartPlug Backend API server running on port ${PORT}`);
  console.log(`🔗 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`📊 Mock devices available for testing`);
});

export default app;