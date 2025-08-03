import { Page } from 'playwright';

// A simple list of websites to visit for warmup
const WARMUP_SITES = [
  'https://www.google.com',
  'https://www.bing.com',
  'https://www.wikipedia.org',
  'https://www.amazon.com',
];

export class WarmupEngine {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async humanLikeWait(min: number = 1, max: number = 5) {
    const waitTime = (Math.random() * (max - min) + min) * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  async executeWarmupSequence(steps: number = 3) {
    console.log('🔥 Starting browser warmup sequence...');
    for (let i = 0; i < steps; i++) {
      const site = WARMUP_SITES[Math.floor(Math.random() * WARMUP_SITES.length)];
      try {
        console.log(`Navigating to ${site}...`);
        await this.page.goto(site, { waitUntil: 'domcontentloaded' });
        await this.humanLikeWait(3, 7); // Simulate reading time

        // Simulate some scrolling
        await this.page.evaluate(() => {
          window.scrollBy(0, Math.random() * 500 + 200);
        });
        await this.humanLikeWait();

      } catch (error) {
        console.error(`Failed to warm up with site ${site}:`, error);
      }
    }
    console.log('✅ Warmup sequence completed.');
  }
}
