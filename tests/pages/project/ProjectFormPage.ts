// tests_v1/pages/ProjectFormPage.ts
import { Page } from '@playwright/test';

/**
 * Project Form Page Object Model - for creating and updating projects
 */
export class ProjectFormPage {
  constructor(public readonly page: Page) {}

  async clickAddProjectButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'เพิ่มไซต์งาน' }).click();
    await this.page.waitForSelector('.modal, form', { state: 'visible' });
  }

  async fillProjectName(name: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'เช่น โครงการก่อสร้าง A' }).fill(name);
  }

  async fillProjectLocation(location: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'ระบุที่ตั้งโดยสังเขป' }).fill(location);
  }

  async fillProjectBudget(budget: string): Promise<void> {
    const budgetInput = this.page.getByPlaceholder('0.00').first();
    await budgetInput.clear();
    await budgetInput.pressSequentially(budget);
  }

  async fillStartDate(date: string): Promise<void> {
    await this.page.locator('input[name="start_date"]').fill(date);
  }

  async fillEndDate(date: string): Promise<void> {
    await this.page.locator('input[name="end_date"]').fill(date);
  }

  async clickCreateProjectButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'สร้างไซต์งาน' }).click();
    // Wait for the confirmation modal to appear instead of networkidle
    await this.page.waitForSelector('.swal2-container', { state: 'visible' });
  }

  async createNewProject(projectData: Partial<{
    name: string;
    location: string;
    budget: string;
    startDate: string;
    endDate: string;
  }>): Promise<void> {
    await this.clickAddProjectButton();
    if (projectData.name) await this.fillProjectName(projectData.name);
    if (projectData.location) await this.fillProjectLocation(projectData.location);
    if (projectData.budget) await this.fillProjectBudget(projectData.budget);
    if (projectData.startDate) await this.fillStartDate(projectData.startDate);
    if (projectData.endDate) await this.fillEndDate(projectData.endDate);
    await this.clickCreateProjectButton();
  }
}
