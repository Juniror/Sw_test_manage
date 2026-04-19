import { BasePage } from '../base/BasePage';
import { Locator, Page } from '@playwright/test';

export interface IncomeData {
  category: string;
  amount: string;
  checkDate?: string;
  transferDate?: string;
}

export class IncomeFormPage extends BasePage {

  readonly categorySelect: Locator;
  readonly amountInput: Locator;
  readonly checkDateInput: Locator;
  readonly transferDateInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);


    this.categorySelect = page.locator('select[name="site_id"]');

    this.amountInput = page.getByPlaceholder('0.00');

    this.checkDateInput = page.locator('input[name="check_date"]');
    this.transferDateInput = page.locator('input[name="transfer_date"]');
    this.submitButton = page.getByRole('button', { name: 'บันทึกข้อมูลรายรับ', exact: true });
  }

  async fillForm(data: Partial<IncomeData>) {

    await this.waitForLoading();
    if (data.category) {
      await this.categorySelect.locator('option').nth(1).waitFor({ timeout: 5000 }).catch(() => {});
      await this.categorySelect.selectOption(data.category).catch(() => this.categorySelect.selectOption({ index: 1 }));
    }

    if (data.amount) {
      await this.amountInput.waitFor({ state: 'visible' });
      await this.amountInput.clear();
      await this.amountInput.pressSequentially(data.amount);
    }

    if (data.checkDate) {
      await this.checkDateInput.fill(data.checkDate);
    }

    if (data.transferDate) {
      await this.transferDateInput.fill(data.transferDate);
    }
  }

  async submit() {

    await this.waitForLoading();
    await this.submitButton.click();
    await this.submitButton.waitFor({ state: 'hidden' });
  }

  async getCategoryOptions(): Promise<string[]> {
    await this.categorySelect.waitFor({ state: 'visible' });
    return await this.categorySelect.locator('option').allTextContents();
  }
}
