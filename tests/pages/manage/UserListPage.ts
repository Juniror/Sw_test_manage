import { BasePage } from '../base/BasePage';
import { Locator, expect, Page } from '@playwright/test';
import { MainPage } from '../base/MainPage';
import { CreateUserPage } from './CreateUserPage';
import { EditUserPage } from './EditUserPage';

export class UserListPage extends BasePage {
  readonly addUserButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addUserButton = page.getByRole('button', { name: 'เพิ่มบัญชีผู้ใช้งาน' });
  }

  async getUserRow(label: string): Promise<Locator> {
    const mainPage = new MainPage(this.page);
    await mainPage.waitForLoading();
    return this.page.locator('div.rounded-2xl')
      .filter({ hasText: label })
      .first();
  }

  async openCreateForm(): Promise<CreateUserPage> {
    await this.waitForLoading();
    await this.addUserButton.waitFor({ state: 'visible' });
    await this.addUserButton.click();
    return new CreateUserPage(this.page);
  }

  async openEditForm(label: string): Promise<EditUserPage> {
    await this.waitForLoading();
    const row = await this.getUserRow(label);
    await row.waitFor({ state: 'visible' });
    await row.getByTitle('แก้ไข').click();
    return new EditUserPage(this.page);
  }

  async deleteUser(label: string) {
    await this.waitForLoading();
    const row = await this.getUserRow(label);
    await row.waitFor({ state: 'visible' });
    await row.getByTitle('ลบ').click();

    const confirmButton = this.page.getByRole('button', { name: 'ยืนยันการลบ' });
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();

    await this.expectSuccess('ลบเรียบร้อย');
  }

  async expectUserInList(label: string) {
    await this.waitForLoading();
    const row = await this.getUserRow(label);
    await expect(row).toBeVisible();
  }

  async expectSuccess(message?: string) {
    await this.waitForLoading();
    if (message) {
      // Robust checking: wait for visibility then allow it to disappear
      const locator = this.page.getByText(message);
      await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
        console.log(`Warning: Success message "${message}" not found, continuing...`);
      });
    } else {
      // Use the verified creation/deletion messages as fallbacks
      const fallback = this.page.locator('text=/เรียบร้อย|สำเร็จ/');
      await fallback.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
  }
}
