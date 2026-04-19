import { BasePage } from '../base/BasePage';
import { Page } from '@playwright/test';

export class ProjectFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickAddProjectButton(): Promise<void> {
    await this.waitForLoading();
    await this.page.getByRole('button', { name: 'เพิ่มไซต์งาน' }).click();
    await this.page.waitForSelector('.modal, form', { state: 'visible' });
  }

  async fillProjectName(name: string): Promise<void> {
    await this.waitForLoading();
    await this.page.getByRole('textbox', { name: 'เช่น โครงการก่อสร้าง A' }).fill(name);
  }

  async fillProjectLocation(location: string): Promise<void> {
    await this.waitForLoading();
    await this.page.getByRole('textbox', { name: 'ระบุที่ตั้งโดยสังเขป' }).fill(location);
  }

  async fillProjectBudget(budget: string): Promise<void> {
    await this.waitForLoading();
    const budgetInput = this.page.getByPlaceholder('0.00').first();
    await budgetInput.clear();
    await budgetInput.pressSequentially(budget);
  }

  async fillStartDate(date: string): Promise<void> {
    await this.waitForLoading();
    await this.page.locator('input[name="start_date"]').fill(date);
  }

  async fillEndDate(date: string): Promise<void> {
    await this.waitForLoading();
    await this.page.locator('input[name="end_date"]').fill(date);
  }

  async clickCreateProjectButton(): Promise<void> {
    await this.waitForLoading();
    await this.page.getByRole('button', { name: 'สร้างไซต์งาน' }).click();
    await this.page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await this.waitForLoading();
  }

  async createNewProject(projectData: Partial<{
    name: string;
    location: string;
    budget: string;
    startDate: string;
    endDate: string;
  }>): Promise<void> {
    await this.waitForLoading();
    await this.clickAddProjectButton();
    if (projectData.name) await this.fillProjectName(projectData.name);
    if (projectData.location) await this.fillProjectLocation(projectData.location);
    if (projectData.budget) await this.fillProjectBudget(projectData.budget);
    if (projectData.startDate) await this.fillStartDate(projectData.startDate);
    if (projectData.endDate) await this.fillEndDate(projectData.endDate);
    await this.clickCreateProjectButton();
  }
}
