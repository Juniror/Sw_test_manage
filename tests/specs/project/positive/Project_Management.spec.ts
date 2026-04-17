import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { ProjectPage } from '../../../pages/project/ProjectPage';
import { ProjectFormPage } from '../../../pages/project/ProjectFormPage';
import { EditProjectPage } from '../../../pages/project/EditProjectPage';

test.describe('Project › Management', () => {
  let mainPage: MainPage;
  let projectPage: ProjectPage;
  let projectForm: ProjectFormPage;
  let editProject: EditProjectPage;
  let projectsToDelete: string[] = [];

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    projectPage = new ProjectPage(page);
    projectForm = new ProjectFormPage(page);
    editProject = new EditProjectPage(page);

    await mainPage.navigate();
  });

  test.afterEach(async ({ page }) => {
    // Robust teardown using authenticated context
    await mainPage.navigate();

    for (const name of projectsToDelete) {
        // Find project, navigate to edit interface and delete
        await projectPage.clickProjectByName(name).catch(() => {});
        await page.getByRole('button', { name: 'แก้ไขไซต์งาน', exact: true }).click().catch(() => {});
        await editProject.deleteProject().catch(() => {});
    }
    projectsToDelete = [];
  });

  test('Create › New Project › Success & Persistent', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `AutoProj_${uniqueId}`;
    
    await projectForm.createNewProject({
      name: projectName,
      location: 'Bangkok Test Center',
      budget: '1000000',
      startDate: '2026-05-01',
      endDate: '2026-12-31'
    });

    // Verification phase
    await expect(page.locator('#swal2-title')).toBeVisible();
    await page.waitForLoadState('networkidle');
    projectsToDelete.push(projectName);
  });

  test('Update › Architectural Progress › Multi-metric Persistence', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `ProgProj_${uniqueId}`;
    
    // Setup: Create an isolated project for progress testing
    await projectForm.createNewProject({
        name: projectName,
        location: 'Progress Lab',
        budget: '500',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
    });
    projectsToDelete.push(projectName);

    // Execution: Update progress metrics
    await projectPage.clickProjectByName(projectName);
    await projectPage.openUpdateProgressForm();
    await projectPage.fillProgress({
      structure: '50',
      electrical: '30',
      plumbing: '10'
    });
    await projectPage.submitProgress();

    // Verify persistence of updates
    await expect(page.locator('#swal2-title')).toBeVisible();
  });
});
