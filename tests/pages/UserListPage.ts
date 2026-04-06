import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class UserListPage extends BasePage {
  readonly addUserButton: Locator;

  constructor(page: any) {
    super(page);
    this.addUserButton = page.getByRole('button', { name: 'เพิ่มบัญชีผู้ใช้งาน' });
  }

  getUserRow(label: string): Locator {
    return this.page.locator('div.rounded-2xl')
      .filter({ hasText: label })
      .first();
  }

  async openCreateForm() {
    await this.addUserButton.click();
  }

  async openEditForm(label: string) {
    await this.getUserRow(label).getByTitle('แก้ไข').click();
    await this.page.getByText('กำลังโหลดข้อมูล...').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  async deleteUser(label: string) {
    await this.getUserRow(label).getByTitle('ลบ').click();
    await this.page.getByRole('button', { name: 'ยืนยันการลบ' }).click();
    await expect(this.page.getByText('ลบเรียบร้อย')).toBeVisible();
  }
}
