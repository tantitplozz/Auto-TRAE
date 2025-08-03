import { Server, Socket } from 'socket.io';
import * as http from 'http';
import { WebSocketMessage, PurchaseData } from '../types/websocket.types';
import { AIOrchestrator } from './aiOrchestrator';

export class WebSocketService {
  private io: Server;
  private aiOrchestrator: AIOrchestrator;

  constructor() {
    this.aiOrchestrator = new AIOrchestrator();
  }

  public init(server: http.Server): void {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('A client connected to WebSocket');

      socket.on('purchase:start', (data: PurchaseData) => {
        this.handlePurchaseStart(socket, data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  private async handlePurchaseStart(socket: Socket, data: PurchaseData): Promise<void> {
    console.log('Purchase start event received with data:', data);
    try {
      // Notify frontend that the process has started
      const initialProgress: WebSocketMessage = {
        event: 'purchase:status',
        data: { status: 'QUEUEING_TASK', progress: 10 }
      };
      socket.emit(initialProgress.event, initialProgress.data);

      // Start the purchase flow via the orchestrator
      await this.aiOrchestrator.startPurchaseFlow(data.url);

      // Notify frontend that the task is in the queue
      const queuedStatus: WebSocketMessage = {
        event: 'purchase:status',
        data: { status: 'TASK_QUEUED', progress: 25 }
      };
      socket.emit(queuedStatus.event, queuedStatus.data);

      // Here you would listen to events from the task queue worker
      // to provide real-time feedback. This is a simplified example.

    } catch (error) {
      console.error('Error handling purchase start:', error);
      const errorStatus: WebSocketMessage = {
        event: 'purchase:error',
        data: { message: 'Failed to start purchase flow.', error: error.message }
      };
      socket.emit(errorStatus.event, errorStatus.data);
    }
  }

  public sendMessage(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}
