import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { discoveryRouter } from './routes/discovery';
import { devicesRouter } from './routes/devices';
import { DeviceManager } from './services/DeviceManager';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5174';

// Create HTTP server and Socket.IO
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Initialize device manager
const deviceManager = new DeviceManager(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make device manager available to routes
app.locals.deviceManager = deviceManager;

// Routes
app.use('/api/discovery', discoveryRouter);
app.use('/api/devices', devicesRouter);

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

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date()
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
  
  // Send current device states to new client
  socket.emit('initial_state', {
    devices: deviceManager.getConnectedDevices(),
    timestamp: new Date()
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 SmartPlug Backend API server running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready for real-time updates`);
  logger.info(`🔗 CORS enabled for: ${CORS_ORIGIN}`);
  
  // Start device discovery service
  deviceManager.startDiscoveryService();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  deviceManager.shutdown();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  deviceManager.shutdown();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;