import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { ProjectPage } from '../../../pages/project/ProjectPage';
import { ProjectFormPage } from '../../../pages/project/ProjectFormPage';
import { EditProjectPage } from '../../../pages/project/EditProjectPage';
import { ProjectHistoryPage } from '../../../pages/project/ProjectHistoryPage';

test.describe('Project › History › Visual Flow', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let projectPage: ProjectPage;
  let projectForm: ProjectFormPage;
  let editProject: EditProjectPage;
  let projectHistory: ProjectHistoryPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    projectPage = new ProjectPage(page);
    projectForm = new ProjectFormPage(page);
    editProject = new EditProjectPage(page);
    projectHistory = new ProjectHistoryPage(page);

    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('UI › Filter Status › Accessible', async ({ page }) => {
    await mainPage.goToHistory();

    await projectHistory.filterByFinished();

    const finishedFilter = page.getByRole('button', { name: 'เสร็จสิ้น', exact: true });
    await expect(finishedFilter).toHaveClass(/bg-gray-800/);
  });

  test('Lifecycle › Transition to Finished › Success', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `FinishProj_${uniqueId}`;

    // 1. Create a new project
    await projectForm.createNewProject({
      name: projectName,
      location: 'Deployment Site',
      budget: '250000',
      startDate: '2026-04-20',
      endDate: '2026-05-20'
    });

    // 2. Open project and change status to 'Completed' (Value from inspection)
    await projectPage.clickProjectByName(projectName);
    await editProject.editProject({
      status: 'Completed'
    });

    // 3. Navigate to history and verify presence
    await mainPage.navigate(); // Return to dashboard to ensure navigation is fresh
    await mainPage.goToHistory();
    await projectHistory.filterByFinished();

    // Small wait for list to refresh
    await page.waitForTimeout(1000);

    const isVisible = await projectHistory.isProjectInList(projectName);
    expect(isVisible).toBe(true);
  });

  test('Lifecycle › Transition to Cancelled › Success', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `CancelProj_${uniqueId}`;

    // 1. Create a new project
    await projectForm.createNewProject({
      name: projectName,
      location: 'Cancelled Site',
      budget: '1000',
      startDate: '2026-04-20',
      endDate: '2026-05-20'
    });

    // 2. Open project and change status to 'Cancelled'
    await projectPage.clickProjectByName(projectName);
    await editProject.editProject({
      status: 'Cancelled'
    });

    // 3. Navigate to history and verify presence
    await mainPage.navigate();
    await mainPage.goToHistory();
    await projectHistory.filterByCancelled();

    await page.waitForTimeout(1000);

    const isVisible = await projectHistory.isProjectInList(projectName);
    expect(isVisible).toBe(true);
  });

  test('Lifecycle › Transition to On Hold › Success', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `OnHoldProj_${uniqueId}`;

    // 1. Create a new project
    await projectForm.createNewProject({
      name: projectName,
      location: 'Paused Site',
      budget: '50000',
      startDate: '2026-04-20',
      endDate: '2026-05-20'
    });

    // 2. Open project and change status to 'On Hold' (which appears under ระว่างดำเนินการ in History)
    await projectPage.clickProjectByName(projectName);
    await editProject.editProject({
      status: 'On Hold'
    });

    // 3. Navigate to history and verify presence
    await mainPage.navigate();
    await mainPage.goToHistory();
    await projectHistory.filterByInProgress();

    await page.waitForTimeout(1000);

    const isVisible = await projectHistory.isProjectInList(projectName);
    expect(isVisible).toBe(true);
  });
});
