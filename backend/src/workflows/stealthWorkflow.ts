// d:\Trae\backend\src\workflows\stealthWorkflow.ts

import { antiDetectService } from '../services/antiDetectService';
import { warmupService } from '../services/warmupService';

class StealthWorkflow {
  async execute(browser: any) {
    console.log('Executing stealth workflow...');

    const stealthOptions = antiDetectService.getStealthOptions();
    console.log('Stealth options:', stealthOptions);

    await warmupService.warmupSession(browser);

    console.log('Stealth workflow completed.');
  }
}

export const stealthWorkflow = new StealthWorkflow();
