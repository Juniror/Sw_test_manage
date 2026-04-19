import { BasePage } from '../base/BasePage';
import { Locator, Page } from '@playwright/test';
import { MainPage } from '../base/MainPage';

export interface ProjectProgressData {
  structure?: string;
  electrical?: string;
  plumbing?: string;
}

export class ProjectPage extends BasePage {
  readonly structureInput: Locator;
  readonly electricalInput: Locator;
  readonly plumbingInput: Locator;
  readonly updateProgressButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);

    this.updateProgressButton = page.getByRole('button', { name: 'อัปเดทความคืบหน้าไซต์งาน', exact: true });
    this.structureInput = page.locator('input[name="structure"]');
    this.electricalInput = page.locator('input[name="electrical"]');
    this.plumbingInput = page.locator('input[name="plumbing"]');
    this.saveButton = page.getByRole('button', { name: 'บันทึกข้อมูล', exact: true });
  }

  async clickProjectByName(projectName: string) {
    await this.waitForLoading();
    await this.page.getByRole('img', { name: projectName }).click();
    const mainPage = new MainPage(this.page);
    await mainPage.waitForLoading();
  }

  async clickEmployeeTab() {
    await this.waitForLoading();
    // The button in the project details page includes the emoji, distinguishing it from the nav bar
    await this.page.getByRole('button', { name: '👷 พนักงาน' }).click();
    await this.waitForLoading();
  }

  async clickExpenseTab() {
    await this.waitForLoading();
    await this.page.getByRole('button', { name: /ดูค่าใช้จ่าย/, exact: false }).click();
    await this.waitForLoading();
  }

  async openUpdateProgressForm() {
    await this.waitForLoading();
    await this.updateProgressButton.waitFor({ state: 'visible' });
    await this.updateProgressButton.click();
  }

  async fillProgress(data: Partial<ProjectProgressData>) {
    await this.waitForLoading();
    if (data.structure) await this.structureInput.fill(data.structure);
    if (data.electrical) await this.electricalInput.fill(data.electrical);
    if (data.plumbing) await this.plumbingInput.fill(data.plumbing);
  }

  async submitProgress() {
    await this.waitForLoading();
    await this.saveButton.click();
    const mainPage = new MainPage(this.page);
    await mainPage.waitForLoading();
    // Wait for button to hide with a timeout to avoid hanging if the app doesn't hide it immediately
    await this.saveButton.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}
