import { Page } from 'playwright';

const RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 2560, height: 1440 },
];

export class ScreenResolutionFaker {
  static getRandomResolution(): { width: number; height: number } {
    const index = Math.floor(Math.random() * RESOLUTIONS.length);
    return RESOLUTIONS[index];
  }

  static async apply(page: Page) {
    const resolution = this.getRandomResolution();
    try {
      console.log(`📺 Faking screen resolution to: ${resolution.width}x${resolution.height}`);
      await page.setViewportSize(resolution);
    } catch (error) {
      console.error(`Failed to fake screen resolution:`, error);
    }
  }
}
