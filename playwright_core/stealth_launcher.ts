import { chromium, Browser, Page } from 'playwright';
import { FingerprintGenerator } from 'fingerprint-generator';

// Placeholder for a more advanced stealth plugin integration
const applyStealth = async (page: Page) => {
  await page.addInitScript(() => {
    // Overwrite the webdriver property to prevent detection
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });
};

export class StealthLauncher {
  private browser: Browser | null = null;

  async launch(options: any = {}): Promise<Page> {
    const fingerprintGenerator = new FingerprintGenerator();
    const fingerprint = fingerprintGenerator.getFingerprint();

    this.browser = await chromium.launch({
      headless: options.headless !== undefined ? options.headless : true,
      args: [
        `--user-agent=${fingerprint.userAgent}`,
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const context = await this.browser.newContext();
    const page = await context.newPage();

    await applyStealth(page);

    console.log('🚀 Stealth browser launched with randomized fingerprint.');
    return page;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Browser closed.');
    }
  }
}
