/**
 * ✅ Trae AI Agent System - WebSocket Service
 * Real-time communication service for live updates
 */

import { io, Socket } from 'socket.io-client';
import { apiService } from './api';

// ✅ Event Types
export interface WebSocketEvents {
  // Agent Events
  'agent:status_changed': { agentId: string; status: string; timestamp: string };
  'agent:detection_score_updated': { agentId: string; score: number; timestamp: string };
  'agent:error': { agentId: string; error: string; timestamp: string };

  // Purchase Events
  'purchase:status_changed': { purchaseId: string; status: string; progress?: number; timestamp: string };
  'purchase:completed': { purchaseId: string; result: any; timestamp: string };
  'purchase:failed': { purchaseId: string; error: string; timestamp: string };

  // Task Events
  'task:progress': { taskId: string; progress: number; message?: string; timestamp: string };
  'task:completed': { taskId: string; result: any; timestamp: string };
  'task:failed': { taskId: string; error: string; timestamp: string };

  // Session Events
  'session:created': { sessionId: string; agentId: string; fingerprint: string; timestamp: string };
  'session:trust_score_updated': { sessionId: string; trustScore: number; timestamp: string };
  'session:expired': { sessionId: string; timestamp: string };

  // AI Decision Events
  'ai:decision_made': { 
    decisionId: string; 
    agentId: string; 
    context: string; 
    decision: any; 
    confidence: number; 
    timestamp: string 
  };

  // System Events
  'system:health_update': { status: string; metrics: any; timestamp: string };
  'system:alert': { level: 'info' | 'warning' | 'error'; message: string; timestamp: string };
  'system:maintenance': { status: 'starting' | 'in_progress' | 'completed'; timestamp: string };

  // Queue Events
  'queue:job_added': { queueName: string; jobId: string; type: string; timestamp: string };
  'queue:job_completed': { queueName: string; jobId: string; result: any; timestamp: string };
  'queue:job_failed': { queueName: string; jobId: string; error: string; timestamp: string };

  // User Events
  'user:notification': { type: string; title: string; message: string; timestamp: string };
  'user:session_expired': { timestamp: string };
}

export type WebSocketEventName = keyof WebSocketEvents;
export type WebSocketEventData<T extends WebSocketEventName> = WebSocketEvents[T];

// ✅ Connection States
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// ✅ Event Listener Type
export type EventListener<T extends WebSocketEventName> = (data: WebSocketEventData<T>) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  // ✅ Connection Management
  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = apiService.getToken();
    if (!token) {
      console.error('No authentication token available for WebSocket connection');
      this.setConnectionState(ConnectionState.ERROR);
      return;
    }

    this.setConnectionState(ConnectionState.CONNECTING);

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    
    this.socket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupSocketEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  // ✅ Socket Event Listeners Setup
  private setupSocketEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.setConnectionState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.setConnectionState(ConnectionState.DISCONNECTED);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.setConnectionState(ConnectionState.ERROR);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.setConnectionState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`WebSocket reconnection attempt ${attemptNumber}`);
      this.setConnectionState(ConnectionState.RECONNECTING);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.setConnectionState(ConnectionState.ERROR);
    });

    // ✅ Setup application event listeners
    this.setupApplicationEventListeners();
  }

  // ✅ Application Event Listeners
  private setupApplicationEventListeners(): void {
    if (!this.socket) return;

    // Agent Events
    this.socket.on('agent:status_changed', (data) => {
      this.emit('agent:status_changed', data);
    });

    this.socket.on('agent:detection_score_updated', (data) => {
      this.emit('agent:detection_score_updated', data);
    });

    this.socket.on('agent:error', (data) => {
      this.emit('agent:error', data);
    });

    // Purchase Events
    this.socket.on('purchase:status_changed', (data) => {
      this.emit('purchase:status_changed', data);
    });

    this.socket.on('purchase:completed', (data) => {
      this.emit('purchase:completed', data);
    });

    this.socket.on('purchase:failed', (data) => {
      this.emit('purchase:failed', data);
    });

    // Task Events
    this.socket.on('task:progress', (data) => {
      this.emit('task:progress', data);
    });

    this.socket.on('task:completed', (data) => {
      this.emit('task:completed', data);
    });

    this.socket.on('task:failed', (data) => {
      this.emit('task:failed', data);
    });

    // Session Events
    this.socket.on('session:created', (data) => {
      this.emit('session:created', data);
    });

    this.socket.on('session:trust_score_updated', (data) => {
      this.emit('session:trust_score_updated', data);
    });

    this.socket.on('session:expired', (data) => {
      this.emit('session:expired', data);
    });

    // AI Decision Events
    this.socket.on('ai:decision_made', (data) => {
      this.emit('ai:decision_made', data);
    });

    // System Events
    this.socket.on('system:health_update', (data) => {
      this.emit('system:health_update', data);
    });

    this.socket.on('system:alert', (data) => {
      this.emit('system:alert', data);
    });

    this.socket.on('system:maintenance', (data) => {
      this.emit('system:maintenance', data);
    });

    // Queue Events
    this.socket.on('queue:job_added', (data) => {
      this.emit('queue:job_added', data);
    });

    this.socket.on('queue:job_completed', (data) => {
      this.emit('queue:job_completed', data);
    });

    this.socket.on('queue:job_failed', (data) => {
      this.emit('queue:job_failed', data);
    });

    // User Events
    this.socket.on('user:notification', (data) => {
      this.emit('user:notification', data);
    });

    this.socket.on('user:session_expired', (data) => {
      this.emit('user:session_expired', data);
      // Auto-logout on session expiry
      apiService.logout();
      window.location.href = '/login';
    });
  }

  // ✅ Event Management
  on<T extends WebSocketEventName>(event: T, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off<T extends WebSocketEventName>(event: T, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit<T extends WebSocketEventName>(event: T, data: WebSocketEventData<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // ✅ Connection State Management
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.stateListeners.forEach(listener => {
        try {
          listener(state);
        } catch (error) {
          console.error('Error in connection state listener:', error);
        }
      });
    }
  }

  onConnectionStateChange(listener: (state: ConnectionState) => void): void {
    this.stateListeners.add(listener);
  }

  offConnectionStateChange(listener: (state: ConnectionState) => void): void {
    this.stateListeners.delete(listener);
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  // ✅ Message Sending
  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send message:', event, data);
    }
  }

  // ✅ Room Management
  joinRoom(room: string): void {
    this.send('join_room', { room });
  }

  leaveRoom(room: string): void {
    this.send('leave_room', { room });
  }

  // ✅ Utility Methods
  private setupEventListeners(): void {
    // Auto-connect when authentication token is available
    if (apiService.isAuthenticated()) {
      this.connect();
    }

    // Listen for authentication changes
    window.addEventListener('storage', (event) => {
      if (event.key === 'access_token') {
        if (event.newValue) {
          this.connect();
        } else {
          this.disconnect();
        }
      }
    });

    // Auto-reconnect on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && apiService.isAuthenticated() && !this.isConnected()) {
        this.connect();
      }
    });
  }

  // ✅ Cleanup
  destroy(): void {
    this.disconnect();
    this.listeners.clear();
    this.stateListeners.clear();
  }
}

// ✅ Export singleton instance
export const wsService = new WebSocketService();
export default wsService;