import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly header: Locator;
  readonly title: Locator;
  readonly testCaseList: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('header');
    this.title = page.locator('h1');
    this.testCaseList = page.locator('[class*="grid"]');
    this.loadingSpinner = page.locator('[class*="animate-spin"]');
  }

  async goto() {
    await this.navigate('/');
  }

  async getHeaderText() {
    return this.title.textContent();
  }

  async waitForTestCasesToLoad() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }
}
