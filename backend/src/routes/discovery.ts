import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import NetworkScanner from '@/services/NetworkScanner';
import logger from '@/utils/logger';
import { 
  DiscoveryRequest, 
  DiscoveryResponse, 
  DeviceProtocol, 
  ApiResponse,
  DiscoveredDevice 
} from '@/types';
import { io } from '../index';

const router = Router();

// Global network scanner instance
let networkScanner: NetworkScanner | null = null;

// Initialize scanner
const getScanner = (): NetworkScanner => {
  if (!networkScanner) {
    networkScanner = new NetworkScanner();
    
    // Set up real-time event forwarding
    networkScanner.on('deviceDiscovered', (device: DiscoveredDevice) => {
      logger.info(`Broadcasting device discovery: ${device.name}`);
      io.emit('device_discovered', device);
    });

    networkScanner.on('error', (error: Error) => {
      logger.error(`Network scanner error: ${error.message}`);
      io.emit('discovery_error', { error: error.message, timestamp: new Date() });
    });
  }
  return networkScanner;
};

// Validation schemas
const discoveryRequestSchema = z.object({
  protocols: z.array(z.nativeEnum(DeviceProtocol)).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  includeOffline: z.boolean().optional(),
});

// POST /api/discovery/scan - Start network device discovery
router.post('/scan', asyncHandler(async (req: Request, res: Response) => {
  const validatedRequest = discoveryRequestSchema.parse(req.body);
  
  const discoveryRequest: DiscoveryRequest = {
    protocols: validatedRequest.protocols || [DeviceProtocol.UPNP],
    timeout: validatedRequest.timeout || 10000,
    includeOffline: validatedRequest.includeOffline || false,
  };

  logger.info(`Starting device discovery scan`, discoveryRequest);

  const scanner = getScanner();
  const startTime = Date.now();

  try {
    // Broadcast scan start
    io.emit('discovery_started', {
      protocols: discoveryRequest.protocols,
      timeout: discoveryRequest.timeout,
      timestamp: new Date(),
    });

    const discoveredDevices = await scanner.scanNetwork(discoveryRequest);
    const scanDuration = Date.now() - startTime;

    logger.info(`Discovery scan completed: ${discoveredDevices.length} devices found in ${scanDuration}ms`);

    // Broadcast scan completion
    io.emit('discovery_completed', {
      devicesFound: discoveredDevices.length,
      scanDuration,
      timestamp: new Date(),
    });

    const response: DiscoveryResponse = {
      success: true,
      data: discoveredDevices,
      message: `Found ${discoveredDevices.length} devices`,
      scanDuration,
      devicesFound: discoveredDevices.length,
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    const scanDuration = Date.now() - startTime;
    
    logger.error(`Discovery scan failed after ${scanDuration}ms: ${error}`);
    
    // Broadcast scan error
    io.emit('discovery_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      scanDuration,
      timestamp: new Date(),
    });

    throw createError(
      error instanceof Error ? error.message : 'Discovery scan failed',
      500
    );
  }
}));

// GET /api/discovery/devices - Get currently discovered devices
router.get('/devices', asyncHandler(async (req: Request, res: Response) => {
  const scanner = getScanner();
  const discoveredDevices = scanner.getDiscoveredDevices();

  const response: ApiResponse<DiscoveredDevice[]> = {
    success: true,
    data: discoveredDevices,
    message: `Retrieved ${discoveredDevices.length} discovered devices`,
    timestamp: new Date(),
  };

  res.json(response);
}));

// DELETE /api/discovery/devices - Clear discovered devices cache
router.delete('/devices', asyncHandler(async (req: Request, res: Response) => {
  const scanner = getScanner();
  scanner.clearDiscoveredDevices();

  logger.info('Cleared discovered devices cache');

  // Broadcast cache clear
  io.emit('discovery_cache_cleared', {
    timestamp: new Date(),
  });

  const response: ApiResponse = {
    success: true,
    message: 'Discovered devices cache cleared',
    timestamp: new Date(),
  };

  res.json(response);
}));

// POST /api/discovery/stop - Stop ongoing discovery scan
router.post('/stop', asyncHandler(async (req: Request, res: Response) => {
  const scanner = getScanner();
  scanner.stopScan();

  logger.info('Discovery scan stopped by user request');

  // Broadcast scan stop
  io.emit('discovery_stopped', {
    timestamp: new Date(),
  });

  const response: ApiResponse = {
    success: true,
    message: 'Discovery scan stopped',
    timestamp: new Date(),
  };

  res.json(response);
}));

// GET /api/discovery/status - Get discovery service status
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  const scanner = getScanner();
  const discoveredDevices = scanner.getDiscoveredDevices();

  const status = {
    isScanning: (scanner as any).isScanning || false, // Access private property for status
    devicesFound: discoveredDevices.length,
    supportedProtocols: Object.values(DeviceProtocol),
    lastScanTime: null, // TODO: Track last scan time
  };

  const response: ApiResponse<typeof status> = {
    success: true,
    data: status,
    message: 'Discovery service status',
    timestamp: new Date(),
  };

  res.json(response);
}));

// Cleanup on process exit
process.on('SIGTERM', () => {
  if (networkScanner) {
    networkScanner.destroy();
    networkScanner = null;
  }
});

process.on('SIGINT', () => {
  if (networkScanner) {
    networkScanner.destroy();
    networkScanner = null;
  }
});

export default router;