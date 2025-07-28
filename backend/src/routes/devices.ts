import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import logger from '@/utils/logger';
import { 
  Device, 
  DeviceType, 
  DeviceProtocol, 
  ApiResponse,
  DiscoveredDevice,
  DeviceStatus,
  DeviceCommand,
  DeviceCommandType 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Temporary in-memory storage for MVP
// In production, this would be replaced with database operations
let devices: Device[] = [];

// Validation schemas
const addDeviceSchema = z.object({
  discoveredDevice: z.object({
    id: z.string(),
    name: z.string(),
    ipAddress: z.string(),
    deviceType: z.nativeEnum(DeviceType),
    protocol: z.nativeEnum(DeviceProtocol),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    isSupported: z.boolean(),
    capabilities: z.object({
      hasPowerMonitoring: z.boolean().optional(),
      hasScheduling: z.boolean().optional(),
      hasDimming: z.boolean().optional(),
      hasEnergyMeter: z.boolean().optional(),
      maxPower: z.number().optional(),
      supportedCommands: z.array(z.string()).optional(),
    }),
  }),
  name: z.string().min(1),
  room: z.string().optional(),
  notes: z.string().optional(),
});

const deviceControlSchema = z.object({
  command: z.object({
    type: z.nativeEnum(DeviceCommandType),
    value: z.any().optional(),
    timestamp: z.string().datetime().optional(),
  }),
});

// GET /api/devices - List all user devices
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Filter by user ID when authentication is implemented
  const userDevices = devices;

  logger.info(`Retrieved ${userDevices.length} devices`);

  const response: ApiResponse<Device[]> = {
    success: true,
    data: userDevices,
    message: `Retrieved ${userDevices.length} devices`,
    timestamp: new Date(),
  };

  res.json(response);
}));

// GET /api/devices/:id - Get specific device
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const device = devices.find(d => d.id === id);
  
  if (!device) {
    throw createError('Device not found', 404);
  }

  const response: ApiResponse<Device> = {
    success: true,
    data: device,
    message: 'Device retrieved successfully',
    timestamp: new Date(),
  };

  res.json(response);
}));

// POST /api/devices - Add a discovered device to user's device list
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedRequest = addDeviceSchema.parse(req.body);
  const { discoveredDevice, name, room, notes } = validatedRequest;

  // Check if device already exists
  const existingDevice = devices.find(d => 
    d.ipAddress === discoveredDevice.ipAddress || 
    d.macAddress === discoveredDevice.macAddress
  );

  if (existingDevice) {
    throw createError('Device already exists', 409);
  }

  // Create new device from discovered device
  const newDevice: Device = {
    id: uuidv4(),
    userId: 'default-user', // TODO: Get from authenticated user
    name,
    room: room || 'Unknown',
    deviceType: discoveredDevice.deviceType,
    protocol: discoveredDevice.protocol,
    macAddress: discoveredDevice.macAddress,
    ipAddress: discoveredDevice.ipAddress,
    manufacturer: discoveredDevice.manufacturer,
    model: discoveredDevice.model,
    isOnline: true, // Assume online since we just discovered it
    isEnabled: true,
    lastSeen: new Date(),
    capabilities: {
      hasPowerMonitoring: discoveredDevice.capabilities.hasPowerMonitoring || false,
      hasScheduling: discoveredDevice.capabilities.hasScheduling || false,
      hasDimming: discoveredDevice.capabilities.hasDimming || false,
      hasEnergyMeter: discoveredDevice.capabilities.hasEnergyMeter || false,
      maxPower: discoveredDevice.capabilities.maxPower,
      supportedCommands: discoveredDevice.capabilities.supportedCommands || [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  devices.push(newDevice);

  logger.info(`Added new device: ${newDevice.name} (${newDevice.ipAddress})`);

  const response: ApiResponse<Device> = {
    success: true,
    data: newDevice,
    message: 'Device added successfully',
    timestamp: new Date(),
  };

  res.status(201).json(response);
}));

// PUT /api/devices/:id - Update device settings
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, room, isEnabled } = req.body;

  const deviceIndex = devices.findIndex(d => d.id === id);
  
  if (deviceIndex === -1) {
    throw createError('Device not found', 404);
  }

  // Update device
  const device = devices[deviceIndex];
  if (name) device.name = name;
  if (room) device.room = room;
  if (typeof isEnabled === 'boolean') device.isEnabled = isEnabled;
  device.updatedAt = new Date();

  devices[deviceIndex] = device;

  logger.info(`Updated device: ${device.name} (${device.id})`);

  const response: ApiResponse<Device> = {
    success: true,
    data: device,
    message: 'Device updated successfully',
    timestamp: new Date(),
  };

  res.json(response);
}));

// DELETE /api/devices/:id - Remove device
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deviceIndex = devices.findIndex(d => d.id === id);
  
  if (deviceIndex === -1) {
    throw createError('Device not found', 404);
  }

  const device = devices[deviceIndex];
  devices.splice(deviceIndex, 1);

  logger.info(`Removed device: ${device.name} (${device.id})`);

  const response: ApiResponse = {
    success: true,
    message: 'Device removed successfully',
    timestamp: new Date(),
  };

  res.json(response);
}));

// POST /api/devices/:id/control - Control device (turn on/off, etc.)
router.post('/:id/control', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedRequest = deviceControlSchema.parse(req.body);
  
  const device = devices.find(d => d.id === id);
  
  if (!device) {
    throw createError('Device not found', 404);
  }

  if (!device.isOnline) {
    throw createError('Device is offline', 503);
  }

  if (!device.isEnabled) {
    throw createError('Device is disabled', 403);
  }

  const command: DeviceCommand = {
    ...validatedRequest.command,
    timestamp: new Date(),
  };

  // TODO: Implement actual device control based on protocol
  // For now, simulate the command execution
  logger.info(`Executing command ${command.type} on device ${device.name}`);

  // Simulate command execution delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Create mock device status response
  const deviceStatus: DeviceStatus = {
    deviceId: device.id,
    isOnline: device.isOnline,
    powerState: command.type === DeviceCommandType.POWER_ON ? true : 
                command.type === DeviceCommandType.POWER_OFF ? false : 
                command.type === DeviceCommandType.TOGGLE ? true : false, // Mock toggle
    powerReading: device.capabilities.hasPowerMonitoring ? {
      power: Math.random() * 100, // Mock power reading
      voltage: 230,
      current: 0.5,
      energy: Math.random() * 10,
      timestamp: new Date(),
    } : undefined,
    lastUpdate: new Date(),
  };

  // Update device last seen
  device.lastSeen = new Date();
  const deviceIndex = devices.findIndex(d => d.id === id);
  if (deviceIndex !== -1) {
    devices[deviceIndex] = device;
  }

  const response: ApiResponse<DeviceStatus> = {
    success: true,
    data: deviceStatus,
    message: `Command ${command.type} executed successfully`,
    timestamp: new Date(),
  };

  res.json(response);
}));

// GET /api/devices/:id/status - Get device status
router.get('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const device = devices.find(d => d.id === id);
  
  if (!device) {
    throw createError('Device not found', 404);
  }

  // TODO: Get actual device status from the device
  // For now, return mock status
  const deviceStatus: DeviceStatus = {
    deviceId: device.id,
    isOnline: device.isOnline,
    powerState: Math.random() > 0.5, // Random power state for mock
    powerReading: device.capabilities.hasPowerMonitoring ? {
      power: Math.random() * 100,
      voltage: 230,
      current: 0.5,
      energy: Math.random() * 10,
      timestamp: new Date(),
    } : undefined,
    lastUpdate: new Date(),
  };

  const response: ApiResponse<DeviceStatus> = {
    success: true,
    data: deviceStatus,
    message: 'Device status retrieved successfully',
    timestamp: new Date(),
  };

  res.json(response);
}));

export default router;