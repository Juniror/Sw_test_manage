import { BasePage } from '../base/BasePage';
import { Locator, Page, expect } from '@playwright/test';

export class ExpenseListPage extends BasePage {
  readonly summaryButton: Locator;
  readonly pendingBillsButton: Locator;
  readonly historyButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly confirmApproveButton: Locator;
  readonly confirmRejectButton: Locator;
  readonly reasonInput: Locator;
  readonly historySearchInput: Locator;

  constructor(page: Page) {
    super(page);
    // Main Nav
    this.summaryButton = page.getByRole('button', { name: 'รวมจ่าย', exact: true });
    // Summary Page Links
    this.pendingBillsButton = page.getByRole('button', { name: 'บิลรออนุมัติ' });
    this.historyButton = page.getByRole('button', { name: 'ดูประวัติบิล' });
    // List Actions
    this.approveButton = page.getByRole('button', { name: 'อนุมัติบิล', exact: true });
    this.rejectButton = page.getByRole('button', { name: 'ปฏิเสธบิล', exact: true });
    // Popups
    this.confirmApproveButton = page.getByRole('button', { name: 'ใช่, อนุมัติเลย', exact: true });
    this.confirmRejectButton = page.getByRole('button', { name: 'ยืนยันการปฏิเสธ' });
    this.reasonInput = page.getByPlaceholder('ใส่เหตุผลของคุณที่นี่...');
    this.historySearchInput = page.getByPlaceholder('ค้นหาจากหมายเหตุ หรือยอดเงิน...');
  }

  async navigateToExpenses() {
    await this.waitForLoading();
    // Use a robust click-and-wait-for-url pattern
    await this.summaryButton.click();
    try {
      await this.page.waitForURL(/.*expenses/, { timeout: 5000 });
    } catch (e) {
      // Retry click if navigation didn't happen
      await this.summaryButton.click();
      await this.page.waitForURL(/.*expenses/, { timeout: 10000 });
    }
    await this.waitForLoading();
  }

  async navigateToPendingBills() {
    await this.waitForLoading();
    await this.navigateToExpenses();
    await this.pendingBillsButton.waitFor({ state: 'visible' });
    await this.pendingBillsButton.click();
    await this.waitForLoading();
    await this.page.waitForURL(/.*request/, { timeout: 10000 }).catch(() => {});
  }

  async navigateToBillHistory() {
    await this.waitForLoading();
    await this.navigateToExpenses();
    await this.historyButton.waitFor({ state: 'visible' });
    await this.historyButton.click();
    await this.waitForLoading();
    await this.page.waitForURL(/.*history/, { timeout: 10000 }).catch(() => {});
  }

  async approveFirstBill() {
    await this.waitForLoading();
    await this.approveButton.first().waitFor({ state: 'visible' });
    await this.approveButton.first().click();
    await this.confirmApproveButton.waitFor({ state: 'visible' });
    await this.confirmApproveButton.click();
  }

  async rejectFirstBill(reason: string = 'Test Rejection') {
    await this.waitForLoading();
    const firstReject = this.rejectButton.first();
    await firstReject.waitFor({ state: 'visible' });
    await firstReject.click();
    await this.reasonInput.waitFor({ state: 'visible' });
    await this.reasonInput.fill(reason);
    await this.confirmRejectButton.waitFor({ state: 'visible' });
    await this.confirmRejectButton.click();
  }

  async filterByStatus(status: string) {
    await this.waitForLoading();
    // Use a soft locator for filters as their text can sometimes be slightly different or contain counts
    const filter = this.page.locator('button, div[role="button"]').filter({ hasText: status }).first();
    await filter.waitFor({ state: 'visible' });
    await filter.click();
    await this.waitForLoading();
  }

  async searchHistory(query: string) {
    await this.waitForLoading();
    await this.historySearchInput.waitFor({ state: 'visible' });
    await this.historySearchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.waitForLoading();
  }

  async getBillCount(): Promise<number> {
    const rows = this.page.locator('tbody tr, [role="row"]');
    await rows.first().waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
    return await rows.count();
  }
}
