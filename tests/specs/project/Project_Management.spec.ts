import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { ProjectPage } from '../../pages/project/ProjectPage';
import { ProjectFormPage } from '../../pages/project/ProjectFormPage';
import { EditProjectPage } from '../../pages/project/EditProjectPage';

test.describe('Project › Management', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let projectPage: ProjectPage;
  let projectForm: ProjectFormPage;
  let editProject: EditProjectPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    
    await test.step('Setup: Login and Navigation', async () => {
      await loginPage.navigate();
      await loginPage.login();
      projectPage = new ProjectPage(page);
      projectForm = new ProjectFormPage(page);
      editProject = new EditProjectPage(page);
      await mainPage.navigate();
    });
  });

  test.afterEach(async () => {
    await test.step('Teardown: Return to Main', async () => {
      await loginPage.navigate();
      await loginPage.login();
      await mainPage.navigate();
    });
  });

  test('Create › New Project › Valid Mandatory Fields', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const projectName = `AutoProj_${uniqueId}`;

    await test.step('Action: Create New Project', async () => {
      await projectForm.createNewProject({
        name: projectName,
        location: 'Bangkok Test Center',
        budget: '1000000',
        startDate: '2026-05-01',
        endDate: '2026-12-31'
      });
    });

    await test.step('Verify: Network Stability', async () => {
      await page.waitForLoadState('networkidle');
    });
  });

  test('Update › Architectural Progress › Multi-metric Persistence', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const projectName = `ProgProj_${uniqueId}`;

    await test.step('Setup: Create Project for Progress Update', async () => {
      await projectForm.createNewProject({
          name: projectName,
          location: 'Progress Lab',
          budget: '500',
          startDate: '2026-04-01',
          endDate: '2026-04-30'
      });
    });

    await test.step('Action: Update Project Progress', async () => {
      await projectPage.clickProjectByName(projectName);
      await projectPage.openUpdateProgressForm();
      await projectPage.fillProgress({
        structure: '50',
        electrical: '30',
        plumbing: '10'
      });
      await projectPage.submitProgress();
    });
  });
  test('Assign Worker › Existing Employee › Success', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const projectName = `WorkerProj_${uniqueId}`;

    await test.step('Setup: Create Project for Worker Assignment', async () => {
      await projectForm.createNewProject({
          name: projectName,
          location: 'Worker Branch',
          budget: '700',
          startDate: '2026-04-01',
          endDate: '2026-04-30'
      });
    });

    await test.step('Action: Navigate to Employee Tab and Add Worker', async () => {
      await projectPage.clickProjectByName(projectName);
      await projectPage.clickEmployeeTab();

      // Click "Add Worker" button
      const addWorkerBtn = page.getByRole('button', { name: '+ เพิ่มคนงาน' });
      await addWorkerBtn.waitFor({ state: 'visible' });
      await addWorkerBtn.click();

      // Click the first "Add" button in the modal
      const firstAddBtn = page.getByRole('button', { name: 'เพิ่ม', exact: true }).first();
      await firstAddBtn.waitFor({ state: 'visible' });
      await firstAddBtn.click();
    });

    await test.step('Verify: Worker is assigned to Project', async () => {
      // After clicking "Add", the worker should appear in the list with a "Delete" button
      const deleteBtn = page.getByRole('button', { name: 'ลบ', exact: true }).first();
      await expect(deleteBtn).toBeVisible({ timeout: 10000 });
    });
  });
});
