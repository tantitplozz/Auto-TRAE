import { Page } from 'playwright';

// List of common IANA time zones
const TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/Paris',
];

export class TimezoneSpoofer {
  static getRandomTimezone(): string {
    const index = Math.floor(Math.random() * TIMEZONES.length);
    return TIMEZONES[index];
  }

  static async apply(page: Page) {
    const timezoneId = this.getRandomTimezone();
    try {
      console.log(`🌍 Spoofing timezone to: ${timezoneId}`);
      await page.context().setGeolocation(null); // Clear geolocation to avoid conflicts
      await page.emulateMedia({ colorScheme: 'light' }); // Reset media emulation
      await page.context().setTimezoneId(timezoneId);
    } catch (error) {
      console.error(`Failed to spoof timezone to ${timezoneId}:`, error);
    }
  }
}
