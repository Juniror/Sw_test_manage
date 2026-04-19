import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { ProjectPage } from '../../pages/project/ProjectPage';
import { ProjectFormPage } from '../../pages/project/ProjectFormPage';
import { EditProjectPage } from '../../pages/project/EditProjectPage';

test.describe('Project › Management › Lifecycle', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let projectPage: ProjectPage;
  let projectForm: ProjectFormPage;
  let editProject: EditProjectPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    projectPage = new ProjectPage(page);
    projectForm = new ProjectFormPage(page);
    editProject = new EditProjectPage(page);

    await mainPage.navigate();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Delete › Existing Project › Persistence Removed', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const projectName = `DeleteLifecycle_${uniqueId}`;

    await test.step('Create temporary project', async () => {
      await projectForm.createNewProject({
        name: projectName,
        location: 'Decommissioning Hub',
        budget: '5000',
        startDate: '2026-04-22',
        endDate: '2026-12-31'
      });
    });

    await test.step('Execute deletion through edit form', async () => {
      await projectPage.clickProjectByName(projectName);
      await page.getByRole('button', { name: 'แก้ไขไซต์งาน', exact: true }).click();
      await editProject.deleteProject();
    });

    await test.step('Verify record is removed from dashboard', async () => {
      await expect(page.getByText(projectName)).not.toBeVisible();
    });
  });

  test('Safety › Cancel Deletion › Data Restored', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const projectName = `SafetyStay_${uniqueId}`;

    await test.step('Create reference project', async () => {
      await projectForm.createNewProject({
        name: projectName,
        location: 'Safe Zone',
        budget: '8000',
        startDate: '2026-04-22',
        endDate: '2026-12-31'
      });
    });

    await test.step('Attempt deletion and dismiss dialog', async () => {
      await projectPage.clickProjectByName(projectName);
      await page.getByRole('button', { name: 'แก้ไขไซต์งาน', exact: true }).click();

      // Safety Action: Dismiss the native browser confirm dialog
      page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      await page.getByRole('button', { name: 'ลบไซต์งาน', exact: true }).click();
    });

    await test.step('Reset to dashboard and verify persistence', async () => {
      await mainPage.navigate();
      await expect(page.getByText(projectName)).toBeVisible();
    });
  });
});
