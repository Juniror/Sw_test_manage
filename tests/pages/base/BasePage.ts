import { Page } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoading() {
    const spinners = [
      this.page.locator('div:has-text("กำลังโหลด")'),
      this.page.locator('.swal2-loading'),
      this.page.locator('.swal2-progress-steps')
    ];

    for (const spinner of spinners) {
      if (await spinner.count() > 0) {
        await spinner.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
      }
    }
    
    // Use load instead of networkidle as it's more predictable for this site
    await this.page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500); // Brief buffer for React state updates
  }
}
