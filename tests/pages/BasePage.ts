import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly navUserManagement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navUserManagement = page.getByRole('button', { name: 'จัดการผู้ใช้' });
  }

  async goToUserManagement() {
    await this.navUserManagement.click();
  }
}
