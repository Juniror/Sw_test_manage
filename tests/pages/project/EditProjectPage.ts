import { BasePage } from '../base/BasePage';
import { Page } from '@playwright/test';

export class EditProjectPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickEditProjectButton(): Promise<void> {
    await this.waitForLoading();
    await this.page.getByRole('button', { name: 'แก้ไขไซต์งาน' }).click();
    await this.page.waitForSelector('form', { state: 'visible' });
  }

  async fillSiteName(name: string): Promise<void> {
    await this.waitForLoading();
    await this.page.locator('input[name="site_name"]').fill(name);
  }

  async selectStatus(status: string): Promise<void> {
    await this.waitForLoading();
    await this.page.locator('select[name="status"]').or(this.page.getByRole('combobox').last()).selectOption(status);
  }

  async fillBudget(budget: string): Promise<void> {
    await this.waitForLoading();
    await this.page.getByPlaceholder('เช่น 1000000').fill(budget);
  }

  async clickSaveButton(): Promise<void> {
    await this.waitForLoading();
    await this.page.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }).click();
    // Some actions might redirect immediately, so we make the success popup wait optional
    await this.page.waitForSelector('.swal2-container', { state: 'visible', timeout: 5000 }).catch(() => {});
  }

  async editProject(projectData: Partial<{
    siteName: string;
    status: string;
    budget: string;
  }>): Promise<void> {
    await this.waitForLoading();
    await this.clickEditProjectButton();
    if (projectData.siteName) await this.fillSiteName(projectData.siteName);
    if (projectData.status) await this.selectStatus(projectData.status);
    if (projectData.budget) await this.fillBudget(projectData.budget);
    await this.clickSaveButton();
  }

  async deleteProject(): Promise<void> {
    await this.waitForLoading();
    const deleteButton = this.page.getByRole('button', { name: 'ลบไซต์งาน', exact: true });
    
    // Register a one-time dialog handler to automatically accept the native browser confirm dialog
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await deleteButton.waitFor({ state: 'visible' });
    await deleteButton.click();

    // After accepting the native dialog, the system usually shows a SweetAlert success message
    await this.page.waitForSelector('.swal2-container', { state: 'visible', timeout: 5000 }).catch(() => {});
  }
}
