import app from './app';
import config from './config';
import logger from './utils/logger';
import * as http from 'http';
import { WebSocketService } from './services/websocketService';
import { setupQueueProcessor } from './services/taskQueueService';

const server = http.createServer(app);
const webSocketService = new WebSocketService();
webSocketService.init(server);

setupQueueProcessor();

server.listen(config.port, () => {
  logger.info(`Server with WebSocket is running on port ${config.port}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
