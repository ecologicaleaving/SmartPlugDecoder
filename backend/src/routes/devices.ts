import { Router } from 'express';
import { DeviceManager } from '../services/DeviceManager';
import { DeviceControlCommand, ApiResponse } from '../types';
import { logger } from '../utils/logger';

export const devicesRouter = Router();

// GET /api/devices - Get all connected devices
devicesRouter.get('/', (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    const devices = deviceManager.getConnectedDevices();

    const response: ApiResponse = {
      success: true,
      data: {
        devices,
        count: devices.length,
        onlineCount: devices.filter(d => d.isOnline).length
      },
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error('Failed to get connected devices:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get devices',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});

// GET /api/devices/:id - Get specific device
devicesRouter.get('/:id', (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    const device = deviceManager.getConnectedDevice(req.params.id);

    if (!device) {
      const response: ApiResponse = {
        success: false,
        error: 'Device not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: device,
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error(`Failed to get device ${req.params.id}:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get device',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});

// POST /api/devices/connect - Connect a discovered device
devicesRouter.post('/connect', async (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    const { discoveredDevice, config = {} } = req.body;

    if (!discoveredDevice) {
      const response: ApiResponse = {
        success: false,
        error: 'discoveredDevice is required',
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    logger.info(`Connecting device via API: ${discoveredDevice.name}`);

    const connectedDevice = await deviceManager.connectDevice(discoveredDevice, config);

    const response: ApiResponse = {
      success: true,
      data: connectedDevice,
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error('Failed to connect device:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect device',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});

// POST /api/devices/:id/disconnect - Disconnect a device
devicesRouter.post('/:id/disconnect', async (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    const deviceId = req.params.id;

    logger.info(`Disconnecting device via API: ${deviceId}`);

    await deviceManager.disconnectDevice(deviceId);

    const response: ApiResponse = {
      success: true,
      data: { message: `Device ${deviceId} disconnected` },
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error(`Failed to disconnect device ${req.params.id}:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disconnect device',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});

// POST /api/devices/:id/control - Control a device
devicesRouter.post('/:id/control', async (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    const deviceId = req.params.id;
    const { command, parameters } = req.body;

    if (!command) {
      const response: ApiResponse = {
        success: false,
        error: 'command is required',
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const controlCommand: DeviceControlCommand = {
      deviceId,
      command,
      parameters
    };

    logger.info(`Controlling device via API: ${deviceId} - ${command}`);

    const controlResponse = await deviceManager.controlDevice(controlCommand);

    const response: ApiResponse = {
      success: controlResponse.success,
      data: controlResponse,
      error: controlResponse.error,
      timestamp: new Date()
    };

    res.status(controlResponse.success ? 200 : 500).json(response);

  } catch (error) {
    logger.error(`Failed to control device ${req.params.id}:`, error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to control device',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});

// POST /api/devices/refresh - Refresh all device statuses
devicesRouter.post('/refresh', async (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;

    logger.info('Refreshing all device statuses via API');

    await deviceManager.refreshDeviceStatus();

    const response: ApiResponse = {
      success: true,
      data: { message: 'Device statuses refreshed' },
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error('Failed to refresh device statuses:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh devices',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});