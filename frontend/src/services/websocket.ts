import { io, Socket } from 'socket.io-client';
import type { DiscoveredDevice } from './api';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001';

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface DiscoveryEvents {
  discovery_started: {
    protocols: string[];
    timeout: number;
    timestamp: string;
  };
  discovery_completed: {
    devicesFound: number;
    scanDuration: number;
    timestamp: string;
  };
  discovery_stopped: {
    timestamp: string;
  };
  discovery_error: {
    error: string;
    scanDuration?: number;
    timestamp: string;
  };
  discovery_cache_cleared: {
    timestamp: string;
  };
  device_discovered: DiscoveredDevice;
}

class WebSocketService {
  private socket: Socket | null = null;
  private eventListeners = new Map<string, Set<Function>>();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Connect to WebSocket server
  connect(): Promise<void> {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(WEBSOCKET_URL, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('❌ WebSocket disconnected:', reason);
          this.isConnecting = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('🔴 WebSocket connection error:', error);
          this.isConnecting = false;
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });

        // Set up discovery event listeners
        this.setupDiscoveryListeners();

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Set up discovery-specific event listeners
  private setupDiscoveryListeners(): void {
    if (!this.socket) return;

    // Discovery events
    this.socket.on('discovery_started', (data) => {
      console.log('🔍 Discovery started:', data);
      this.emitToListeners('discovery_started', data);
    });

    this.socket.on('discovery_completed', (data) => {
      console.log('✅ Discovery completed:', data);
      this.emitToListeners('discovery_completed', data);
    });

    this.socket.on('discovery_stopped', (data) => {
      console.log('⏹️ Discovery stopped:', data);
      this.emitToListeners('discovery_stopped', data);
    });

    this.socket.on('discovery_error', (data) => {
      console.error('❌ Discovery error:', data);
      this.emitToListeners('discovery_error', data);
    });

    this.socket.on('discovery_cache_cleared', (data) => {
      console.log('🗑️ Discovery cache cleared:', data);
      this.emitToListeners('discovery_cache_cleared', data);
    });

    this.socket.on('device_discovered', (device) => {
      console.log('📱 Device discovered:', device);
      this.emitToListeners('device_discovered', device);
    });
  }

  // Add event listener
  addEventListener<K extends keyof DiscoveryEvents>(
    event: K, 
    listener: (data: DiscoveryEvents[K]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  // Remove event listener
  removeEventListener<K extends keyof DiscoveryEvents>(
    event: K, 
    listener: (data: DiscoveryEvents[K]) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // Emit event to all listeners
  private emitToListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Join a specific room (for future use)
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room);
    }
  }

  // Leave a specific room (for future use)
  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room);
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect when module is imported
webSocketService.connect().catch(error => {
  console.warn('Failed to auto-connect WebSocket:', error);
});

export default webSocketService;