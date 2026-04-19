import { BasePage } from '../base/BasePage';
import { Locator, Page } from '@playwright/test';

export class IncomeListPage extends BasePage {
  readonly recordIncomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.recordIncomeButton = page.getByRole('button', { name: 'บันทึกรายรับ', exact: true });
  }

  async openRecordForm() {
    await this.waitForLoading();
    await this.recordIncomeButton.waitFor({ state: 'visible' });
    await this.recordIncomeButton.click();
  }

  async navigateToIncome() {
    await this.waitForLoading();
    const btn = this.page.getByRole('button', { name: 'รายรับ', exact: true });
    await btn.waitFor({ state: 'visible' });
    await btn.click();
    await this.waitForLoading();
  }
}
