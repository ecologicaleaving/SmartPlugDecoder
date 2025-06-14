import { Router } from 'express';
import { DeviceManager } from '../services/DeviceManager';
import { DiscoveryOptions, ApiResponse } from '../types';
import { logger } from '../utils/logger';

export const discoveryRouter = Router();

// POST /api/discovery/scan - Start device discovery
discoveryRouter.post('/scan', async (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    const options: DiscoveryOptions = req.body || {};

    logger.info('Starting device discovery via API', options);

    const devices = await deviceManager.startDiscovery(options);

    const response: ApiResponse = {
      success: true,
      data: {
        devices,
        count: devices.length,
        supportedCount: devices.filter(d => d.isSupported).length
      },
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error('Discovery scan failed:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Discovery failed',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});

// GET /api/discovery/devices - Get discovered devices
discoveryRouter.get('/devices', (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    const devices = deviceManager.getDiscoveredDevices();

    const response: ApiResponse = {
      success: true,
      data: {
        devices,
        count: devices.length
      },
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error('Failed to get discovered devices:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get devices',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});

// POST /api/discovery/stop - Stop discovery
discoveryRouter.post('/stop', (req, res) => {
  try {
    const deviceManager: DeviceManager = req.app.locals.deviceManager;
    deviceManager.stopDiscovery();

    const response: ApiResponse = {
      success: true,
      data: { message: 'Discovery stopped' },
      timestamp: new Date()
    };

    res.json(response);

  } catch (error) {
    logger.error('Failed to stop discovery:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop discovery',
      timestamp: new Date()
    };

    res.status(500).json(response);
  }
});