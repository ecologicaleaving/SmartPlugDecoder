import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';

const router = Router();

interface HealthStatus {
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
    // Add more services as they're implemented
  };
}

// GET /api/health - Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal + memUsage.external;
  
  const healthData: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / totalMemory) * 100),
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch,
    },
    services: {
      networkScanner: 'operational',
    },
  };

  const response: ApiResponse<HealthStatus> = {
    success: true,
    data: healthData,
    message: 'Service is healthy',
    timestamp: new Date(),
  };

  res.json(response);
}));

// GET /api/health/ready - Readiness check for Kubernetes
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  // Check if all required services are ready
  const isReady = true; // Add actual readiness checks here
  
  if (isReady) {
    res.status(200).json({
      success: true,
      message: 'Service is ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Service not ready',
      timestamp: new Date().toISOString(),
    });
  }
}));

// GET /api/health/live - Liveness check for Kubernetes
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
  });
}));

export default router;