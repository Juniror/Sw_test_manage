import { BasePage } from '../base/BasePage';
import { Locator, Page } from '@playwright/test';

export class ProjectHistoryPage extends BasePage {
  readonly finishedFilter: Locator;
  readonly cancelledFilter: Locator;
  readonly inProgressFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.finishedFilter = page.getByRole('button', { name: 'เสร็จสิ้น', exact: true });
    this.cancelledFilter = page.getByRole('button', { name: 'ยกเลิก', exact: true });
    this.inProgressFilter = page.getByRole('button', { name: 'ระหว่างดำเนินการ', exact: true });
  }

  async filterByFinished() {
    await this.waitForLoading();
    await this.finishedFilter.waitFor({ state: 'visible' });
    await this.finishedFilter.click();
    await this.waitForLoading();
  }

  async filterByCancelled() {
    await this.waitForLoading();
    await this.cancelledFilter.waitFor({ state: 'visible' });
    await this.cancelledFilter.click();
    await this.waitForLoading();
  }

  async filterByInProgress() {
    await this.waitForLoading();
    await this.inProgressFilter.waitFor({ state: 'visible' });
    await this.inProgressFilter.click();
    await this.waitForLoading();
  }

  async isProjectInList(projectName: string): Promise<boolean> {
    await this.waitForLoading();
    // The browser subagent identified that project names are in <h3> tags
    const projectLocator = this.page.locator('h3').filter({ hasText: projectName });
    return await projectLocator.isVisible();
  }
}
