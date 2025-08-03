// d:\Trae\backend\src\services\taskQueueService.ts

import { Queue, Worker, Job } from 'bullmq';
import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../utils/logger';
import { prisma } from '../models/Purchase';

// ✅ Task Queue System for Python Agents
export interface PurchaseTask {
  id: string;
  agentId: string;
  productUrl: string;
  config: {
    stealthConfig?: any;
    proxy?: any;
    userAgent?: string;
    viewport?: { width: number; height: number };
  };
  userId: string;
}

export interface AgentTask {
  type: 'purchase' | 'warmup' | 'stealth_check';
  data: any;
  priority?: number;
}

// ✅ Purchase Queue
export const purchaseQueue = new Queue('purchases', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// ✅ Stealth Queue for anti-detection tasks
export const stealthQueue = new Queue('stealth', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

// ✅ Purchase Worker
const purchaseWorker = new Worker('purchases', async (job: Job<PurchaseTask>) => {
  const { id, agentId, productUrl, config, userId } = job.data;
  
  logger.info(`Starting purchase task ${id} for agent ${agentId}`);
  
  try {
    // ✅ Update purchase status to PROCESSING
    await prisma.purchase.update({
      where: { id },
      data: { status: 'PROCESSING' }
    });

    // ✅ Execute Python agent
    const result = await runPythonAgent('purchase', {
      agentId,
      productUrl,
      config,
      taskId: id
    });

    // ✅ Update purchase with result
    await prisma.purchase.update({
      where: { id },
      data: {
        status: 'SUCCESS',
        result: result
      }
    });

    logger.info(`Purchase task ${id} completed successfully`);
    return result;

  } catch (error) {
    logger.error(`Purchase task ${id} failed:`, error);
    
    // ✅ Update purchase with error
    await prisma.purchase.update({
      where: { id },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  concurrency: 5,
});

// ✅ Stealth Worker
const stealthWorker = new Worker('stealth', async (job: Job<AgentTask>) => {
  const { type, data } = job.data;
  
  logger.info(`Starting stealth task ${type}`);
  
  try {
    const result = await runPythonAgent(type, data);
    logger.info(`Stealth task ${type} completed`);
    return result;
  } catch (error) {
    logger.error(`Stealth task ${type} failed:`, error);
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  concurrency: 3,
});

// ✅ Execute Python Agent
async function runPythonAgent(taskType: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python';
    const agentsPath = path.join(process.cwd(), '..', 'agents');
    const scriptPath = path.join(agentsPath, 'main.py');

    const args = [
      scriptPath,
      '--task', taskType,
      '--data', JSON.stringify(data)
    ];

    logger.info(`Executing Python agent: ${pythonPath} ${args.join(' ')}`);

    const pythonProcess = spawn(pythonPath, args, {
      cwd: agentsPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          logger.error('Failed to parse Python agent output:', stdout);
          reject(new Error('Invalid Python agent output'));
        }
      } else {
        logger.error(`Python agent exited with code ${code}:`, stderr);
        reject(new Error(`Python agent failed: ${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      logger.error('Python agent process error:', error);
      reject(error);
    });

    // ✅ Timeout after 5 minutes
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python agent timeout'));
    }, 5 * 60 * 1000);
  });
}

// ✅ Queue Management Functions
export class TaskQueueService {
  static async addPurchaseTask(task: PurchaseTask): Promise<Job<PurchaseTask>> {
    return await purchaseQueue.add('purchase', task, {
      priority: 1,
      delay: 0,
    });
  }

  static async addStealthTask(task: AgentTask): Promise<Job<AgentTask>> {
    return await stealthQueue.add(task.type, task, {
      priority: task.priority || 5,
    });
  }

  static async getPurchaseQueueStats() {
    return {
      waiting: await purchaseQueue.getWaiting(),
      active: await purchaseQueue.getActive(),
      completed: await purchaseQueue.getCompleted(),
      failed: await purchaseQueue.getFailed(),
    };
  }

  static async getStealthQueueStats() {
    return {
      waiting: await stealthQueue.getWaiting(),
      active: await stealthQueue.getActive(),
      completed: await stealthQueue.getCompleted(),
      failed: await stealthQueue.getFailed(),
    };
  }

  static async clearQueues() {
    await purchaseQueue.obliterate({ force: true });
    await stealthQueue.obliterate({ force: true });
  }
}

// ✅ Setup Queue Processor (backward compatibility)
export const setupQueueProcessor = () => {
  logger.info('Task queue workers setup complete.');
};

// ✅ Event Listeners
purchaseWorker.on('completed', (job) => {
  logger.info(`Purchase job ${job.id} completed`);
});

purchaseWorker.on('failed', (job, err) => {
  logger.error(`Purchase job ${job?.id} failed:`, err);
});

stealthWorker.on('completed', (job) => {
  logger.info(`Stealth job ${job.id} completed`);
});

stealthWorker.on('failed', (job, err) => {
  logger.error(`Stealth job ${job?.id} failed:`, err);
});

export { purchaseWorker, stealthWorker };
