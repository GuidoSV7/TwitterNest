import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext } from 'playwright';

@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  private browser: Browser;
  private context: BrowserContext;

  async onModuleInit() {
    await this.initBrowser();
  }

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  private async initBrowser() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      this.logger.log('Browser initialized');
    } catch (error) {
      this.logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  private async closeBrowser() {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async getTwitterDescription(url: string): Promise<string[]> {
    const page = await this.context.newPage();

    try {
      this.logger.log(`Scraping: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Esperar el texto del tweet
      await page.waitForSelector('[data-testid="tweetText"]', {
        timeout: 15000
      });

      // Extraer solo el texto
      const description = await page.evaluate(() => {
        const tweetElement = document.querySelector('[data-testid="tweetText"]');
        return tweetElement?.textContent?.trim() || '';
      });

      if (!description) {
        throw new Error('No se pudo extraer el texto del tweet');
      }

      // Separar en palabras y limpiar espacios/saltos de línea
      const words = description
        .split(/\s+/) // Dividir por cualquier espacio (incluye saltos de línea)
        .filter(word => word.length > 0); // Filtrar palabras vacías

      this.logger.log(`Extracted ${words.length} words from tweet`);
      return words;

    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw new Error(`Failed to scrape tweet: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async validateTwitterContent(url: string, requiredItems: string[]): Promise<{
    isValid: boolean;
    found: string[];
    missing: string[];
    tweetText: string;
  }> {
    const page = await this.context.newPage();

    try {
      this.logger.log(`Validating tweet: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await page.waitForSelector('[data-testid="tweetText"]', {
        timeout: 15000
      });

      // Extraer el texto completo del tweet
      const tweetText = await page.evaluate(() => {
        const tweetElement = document.querySelector('[data-testid="tweetText"]');
        return tweetElement?.textContent?.trim() || '';
      });

      if (!tweetText) {
        throw new Error('No se pudo extraer el texto del tweet');
      }

      // Validar cada item requerido
      const found: string[] = [];
      const missing: string[] = [];

      for (const item of requiredItems) {
        const itemToCheck = item.trim();
        
        // Buscar el item en el texto (case insensitive)
        if (tweetText.toLowerCase().includes(itemToCheck.toLowerCase())) {
          found.push(itemToCheck);
        } else {
          missing.push(itemToCheck);
        }
      }

      const isValid = missing.length === 0;

      this.logger.log(`Validation result: ${isValid ? 'VALID' : 'INVALID'} - Found: ${found.length}/${requiredItems.length}`);

      return {
        isValid,
        found,
        missing,
        tweetText
      };

    } catch (error) {
      this.logger.error(`Error validating tweet: ${error.message}`);
      throw new Error(`Failed to validate tweet: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  isValidTwitterUrl(url: string): boolean {
    const pattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    return pattern.test(url);
  }
}
