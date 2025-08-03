import { Page } from 'playwright';

const LANGUAGES = ['en-US,en;q=0.9', 'en-GB,en;q=0.8', 'fr-FR,fr;q=0.9', 'de-DE,de;q=0.9', 'es-ES,es;q=0.9'];

export class LanguageRandomizer {
  static getRandomLanguage(): string {
    const index = Math.floor(Math.random() * LANGUAGES.length);
    return LANGUAGES[index];
  }

  static async apply(page: Page) {
    const language = this.getRandomLanguage();
    try {
      console.log(`🗣️  Randomizing language to: ${language}`);
      await page.setExtraHTTPHeaders({ 'Accept-Language': language });
    } catch (error) {
      console.error(`Failed to randomize language to ${language}:`, error);
    }
  }
}
