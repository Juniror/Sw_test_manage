// tests_v1/pages/EditProjectPage.ts
import { Page } from '@playwright/test';

/**
 * Edit Project Page Object Model - for editing project details
 */
export class EditProjectPage {
  constructor(public readonly page: Page) {}

  async clickEditProjectButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'แก้ไขไซต์งาน' }).click();
    await this.page.waitForSelector('form', { state: 'visible' });
  }

  async fillSiteName(name: string): Promise<void> {
    await this.page.locator('input[name="site_name"]').fill(name);
  }

  async selectStatus(status: string): Promise<void> {
    await this.page.getByRole('combobox').selectOption(status);
  }

  async fillBudget(budget: string): Promise<void> {
    await this.page.getByPlaceholder('เช่น 1000000').fill(budget);
  }

  async clickSaveButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }).click();
    await this.page.waitForSelector('.swal2-container', { state: 'visible' });
  }

  async editProject(projectData: Partial<{
    siteName: string;
    status: string;
    budget: string;
  }>): Promise<void> {
    await this.clickEditProjectButton();
    if (projectData.siteName) await this.fillSiteName(projectData.siteName);
    if (projectData.status) await this.selectStatus(projectData.status);
    if (projectData.budget) await this.fillBudget(projectData.budget);
    await this.clickSaveButton();
  }

  /**
   * Deletes the currently opened project and handles the confirmation modal.
   */
  async deleteProject(): Promise<void> {
    const deleteButton = this.page.getByRole('button', { name: 'ลบไซต์งาน', exact: true });
    await deleteButton.waitFor({ state: 'visible' });
    await deleteButton.click();

    // Confirm SweetAlert2 modal
    const confirmButton = this.page.getByRole('button', { name: 'ยืนยันการลบ', exact: true });
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();
    
    // Wait for the final confirmation Swall or the dashboard update
    await this.page.waitForSelector('.swal2-container', { state: 'visible' });
  }
}
