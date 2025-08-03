/**
 * ✅ Enhanced WebSocket Service
 * Military-grade real-time communication with authentication and event handling
 */

import { io, Socket } from 'socket.io-client';
import React from 'react';

interface WebSocketConfig {
  url: string;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  timeout: number;
}

interface AuthData {
  token: string;
  userId: string;
  sessionId: string;
}

interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
  source: string;
}

interface ConnectionState {
  connected: boolean;
  authenticated: boolean;
  reconnecting: boolean;
  lastConnected: string | null;
  connectionAttempts: number;
  latency: number;
}

// Event types for type safety
export interface AgentEvent {
  type: 'AGENT_STATUS_CHANGE' | 'AGENT_DETECTION_SCORE' | 'AGENT_ERROR';
  agentId: string;
  data: any;
}

export interface PurchaseEvent {
  type: 'PURCHASE_STATUS_CHANGE' | 'PURCHASE_COMPLETED' | 'PURCHASE_FAILED';
  purchaseId: string;
  data: any;
}

export interface TaskEvent {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_FAILED';
  taskId: string;
  data: any;
}

export interface SessionEvent {
  type: 'SESSION_EXPIRED' | 'SESSION_RENEWED';
  data: any;
}

export interface AIDecisionEvent {
  type: 'AI_DECISION_MADE' | 'AI_STRATEGY_UPDATED';
  data: any;
}

export interface SystemEvent {
  type: 'SYSTEM_ALERT' | 'SYSTEM_MAINTENANCE' | 'SYSTEM_UPDATE';
  data: any;
}

export interface QueueEvent {
  type: 'QUEUE_SIZE_CHANGED' | 'QUEUE_PROCESSING_RATE';
  data: any;
}

export interface UserEvent {
  type: 'USER_ACTION' | 'USER_PREFERENCE_CHANGED';
  data: any;
}

export interface FingerprintEvent {
  type: 'FINGERPRINT_UPDATE' | 'FINGERPRINT_ROTATION';
  data: any;
}

export interface DetectionEvent {
  type: 'DETECTION_SCORE' | 'DETECTION_ALERT';
  data: any;
}

type AllWebSocketEvents = 
  | AgentEvent 
  | PurchaseEvent 
  | TaskEvent 
  | SessionEvent 
  | AIDecisionEvent 
  | SystemEvent 
  | QueueEvent 
  | UserEvent
  | FingerprintEvent
  | DetectionEvent;

type EventHandler = (data: any) => void;
type ConnectionHandler = (state: ConnectionState) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private authData: AuthData | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private connectionHandlers: ConnectionHandler[] = [];
  private connectionState: ConnectionState = {
    connected: false,
    authenticated: false,
    reconnecting: false,
    lastConnected: null,
    connectionAttempts: 0,
    latency: 0
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: process.env.REACT_APP_WS_URL || 'ws://localhost:8080',
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      ...config
    };

    // Auto-connect if enabled and auth token exists
    if (this.config.autoConnect && this.getStoredToken()) {
      this.connect();
    }
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          resolve(true);
          return;
        }

        this.updateConnectionState({ 
          reconnecting: true,
          connectionAttempts: this.connectionState.connectionAttempts + 1
        });

        this.socket = io(this.config.url, {
          autoConnect: false,
          reconnection: this.config.reconnection,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
          timeout: this.config.timeout,
          transports: ['websocket', 'polling'],
          upgrade: true,
          rememberUpgrade: true
        });

        this.setupEventListeners();
        this.socket.connect();

        // Connection timeout
        const timeout = setTimeout(() => {
          if (!this.connectionState.connected) {
            this.socket?.disconnect();
            reject(new Error('Connection timeout'));
          }
        }, this.config.timeout);

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          this.updateConnectionState({ 
            connected: true, 
            reconnecting: false,
            lastConnected: new Date().toISOString()
          });
          
          // Auto-authenticate if token exists
          const token = this.getStoredToken();
          if (token) {
            this.authenticate({ 
              token, 
              userId: this.getStoredUserId() || '',
              sessionId: this.generateSessionId()
            }).then(() => {
              resolve(true);
            }).catch(() => {
              resolve(false);
            });
          } else {
            resolve(true);
          }
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          this.updateConnectionState({ 
            connected: false, 
            reconnecting: false 
          });
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.socket?.disconnect();
    this.socket = null;
    
    this.updateConnectionState({
      connected: false,
      authenticated: false,
      reconnecting: false
    });
  }

  /**
   * Authenticate with the server
   */
  public authenticate(authData: AuthData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.authData = authData;
      
      this.socket.emit('auth', {
        token: authData.token,
        userId: authData.userId,
        sessionId: authData.sessionId,
        timestamp: new Date().toISOString()
      });

      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 10000);

      this.socket.once('auth_success', (data) => {
        clearTimeout(timeout);
        this.updateConnectionState({ authenticated: true });
        this.startHeartbeat();
        this.storeAuthData(authData);
        resolve(true);
      });

      this.socket.once('auth_error', (error) => {
        clearTimeout(timeout);
        this.updateConnectionState({ authenticated: false });
        this.clearStoredAuth();
        reject(new Error(error.message || 'Authentication failed'));
      });
    });
  }

  /**
   * Send message to server
   */
  public send(event: string, data: any): boolean {
    if (!this.socket?.connected || !this.connectionState.authenticated) {
      console.warn('Cannot send message: not connected or authenticated');
      return false;
    }

    const message: WebSocketEvent = {
      type: event,
      payload: data,
      timestamp: new Date().toISOString(),
      source: 'client'
    };

    this.socket.emit(event, message);
    return true;
  }

  /**
   * Subscribe to events
   */
  public on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(handler);

    // Setup socket listener if not already done
    if (this.socket && this.eventHandlers.get(event)!.length === 1) {
      this.socket.on(event, (data) => {
        this.handleEvent(event, data);
      });
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        
        if (handlers.length === 0) {
          this.eventHandlers.delete(event);
          this.socket?.off(event);
        }
      }
    };
  }

  /**
   * Subscribe to connection state changes
   */
  public onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    
    // Immediately call with current state
    handler(this.connectionState);

    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Join a room
   */
  public joinRoom(room: string): boolean {
    return this.send('join_room', { room });
  }

  /**
   * Leave a room
   */
  public leaveRoom(room: string): boolean {
    return this.send('leave_room', { room });
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if connected and authenticated
   */
  public isReady(): boolean {
    return this.connectionState.connected && this.connectionState.authenticated;
  }

  /**
   * Measure latency
   */
  public ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      const start = Date.now();
      
      this.socket.emit('ping', { timestamp: start });
      
      const timeout = setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);

      this.socket.once('pong', () => {
        clearTimeout(timeout);
        const latency = Date.now() - start;
        this.updateConnectionState({ latency });
        resolve(latency);
      });
    });
  }

  /**
   * Emit event (alias for send)
   */
  public emit(eventType: string, data: any): boolean {
    return this.send(eventType, data);
  }

  public startPurchase(url: string): void {
    this.send('purchase:start', { url });
  }

  public off(event: string, listener?: (data: any) => void): void {
    if (listener) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(listener);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    } else {
      this.eventHandlers.delete(event);
    }
    this.socket?.off(event, listener);
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      this.updateConnectionState({ 
        connected: false, 
        authenticated: false 
      });

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Auto-reconnect if not manual disconnect
      if (reason !== 'io client disconnect' && this.config.reconnection) {
        this.scheduleReconnect();
      }
    });

    this.socket.on('reconnect', () => {
      this.updateConnectionState({ 
        connected: true,
        reconnecting: false,
        lastConnected: new Date().toISOString()
      });

      // Re-authenticate
      if (this.authData) {
        this.authenticate(this.authData).catch(console.error);
      }
    });

    this.socket.on('reconnect_attempt', () => {
      this.updateConnectionState({ reconnecting: true });
    });

    this.socket.on('reconnect_failed', () => {
      this.updateConnectionState({ 
        reconnecting: false,
        connected: false,
        authenticated: false
      });
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle pong for latency measurement
    this.socket.on('pong', () => {
      // Handled in ping method
    });
  }

  /**
   * Handle incoming events
   */
  private handleEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Update connection state and notify handlers
   */
  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    
    this.connectionHandlers.forEach(handler => {
      try {
        handler(this.connectionState);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.ping().catch(() => {
        // Ping failed, connection might be lost
        console.warn('Heartbeat ping failed');
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = this.config.reconnectionDelay * Math.pow(2, this.connectionState.connectionAttempts - 1);
    
    this.reconnectTimeout = setTimeout(() => {
      if (!this.connectionState.connected) {
        this.connect().catch(console.error);
      }
    }, Math.min(delay, 30000)); // Max 30 seconds
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Storage helpers
   */
  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStoredUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  private storeAuthData(authData: AuthData): void {
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('user_id', authData.userId);
    localStorage.setItem('session_id', authData.sessionId);
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('session_id');
  }
}

// Create singleton instance
export const wsService = new WebSocketService({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});

// Legacy export for backward compatibility
export const websocketService = wsService;

// React hook for using WebSocket
export const useWebSocket = () => {
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    wsService.getConnectionState()
  );

  React.useEffect(() => {
    const unsubscribe = wsService.onConnectionChange(setConnectionState);
    return unsubscribe;
  }, []);

  const connect = React.useCallback(() => {
    return wsService.connect();
  }, []);

  const disconnect = React.useCallback(() => {
    wsService.disconnect();
  }, []);

  const send = React.useCallback((event: string, data: any) => {
    return wsService.send(event, data);
  }, []);

  const subscribe = React.useCallback((event: string, handler: EventHandler) => {
    return wsService.on(event, handler);
  }, []);

  const joinRoom = React.useCallback((room: string) => {
    return wsService.joinRoom(room);
  }, []);

  const leaveRoom = React.useCallback((room: string) => {
    return wsService.leaveRoom(room);
  }, []);

  const ping = React.useCallback(() => {
    return wsService.ping();
  }, []);

  return {
    connectionState,
    isReady: wsService.isReady(),
    connect,
    disconnect,
    send,
    subscribe,
    joinRoom,
    leaveRoom,
    ping
  };
};

export default wsService;
