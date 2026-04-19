import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MainPage extends BasePage {
  readonly navManageUsers: Locator;
  readonly navEmployees: Locator;
  readonly navIncome: Locator;
  readonly navExpenses: Locator;
  readonly navProfile: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);

    this.navManageUsers = page.getByRole('button', { name: 'จัดการผู้ใช้', exact: true });
    this.navEmployees = page.getByRole('button', { name: 'พนักงาน', exact: true });
    this.navIncome = page.getByRole('button', { name: 'รายรับ', exact: true });
    this.navExpenses = page.getByRole('button', { name: 'รวมจ่าย', exact: true });
    this.navProfile = page.getByRole('button', { name: 'โปรไฟล์', exact: true });

    this.logoutButton = page.getByTitle('ออกจากระบบ').first();
  }

  async navigate(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
    await this.waitForLoading();
  }

  async goToManageUsers() {
    await this.navManageUsers.waitFor({ state: 'visible' });
    await this.navManageUsers.click();
    await this.waitForLoading();
  }

  async goToEmployees() {
    await this.navEmployees.waitFor({ state: 'visible' });
    await this.navEmployees.click();
    await this.waitForLoading();
  }

  async goToIncome() {
    await this.navIncome.waitFor({ state: 'visible' });
    await this.navIncome.click();
    await this.waitForLoading();
  }

  async goToExpenses() {
    await this.navExpenses.waitFor({ state: 'visible' });
    await this.navExpenses.click();
    await this.waitForLoading();
  }

  async goToProfile() {
    await this.navProfile.waitFor({ state: 'visible' });
    await this.navProfile.click();
    await this.waitForLoading();
  }

  async goToHistory() {
    const btn = this.page.getByRole('button', { name: 'ประวัติโครงการ', exact: true });
    await btn.waitFor({ state: 'visible' });
    await btn.click();
    await this.waitForLoading();
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('**/login**');
  }
}
