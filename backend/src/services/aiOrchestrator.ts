import { exec } from 'child_process';
import { purchaseQueue } from './taskQueueService';

export class AIOrchestrator {
  async startPurchaseFlow(productUrl: string) {
    // Add to task queue
    await purchaseQueue.add('purchase', {
      url: productUrl,
      agent: 'stealth_navigator'
    });
    console.log(`Added purchase task for ${productUrl} to the queue.`);
  }

  async runPythonAgent(scriptPath: string, args: object): Promise<any> {
    const script = `d:/Trae/agents/${scriptPath}`;
    return new Promise((resolve, reject) => {
      // Ensure python command is accessible. Consider using a virtual environment.
      const command = `python ${script} '${JSON.stringify(args)}'`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`Python script stderr: ${stderr}`);
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          console.error('Error parsing Python script output:', parseError);
          // Resolve with raw output if not JSON
          resolve(stdout);
        }
      });
    });
  }
}
