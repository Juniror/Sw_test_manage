import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { ProjectPage } from '../../../pages/project/ProjectPage';
import { ProjectFormPage } from '../../../pages/project/ProjectFormPage';
import { EditProjectPage } from '../../../pages/project/EditProjectPage';

test.describe('Project › Deletion', () => {
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

  test.afterEach(async () => {
    // Resilient teardown for lifecycle tests
    await mainPage.navigate();

    for (const name of projectsToDelete) {
        await projectPage.clickProjectByName(name).catch(() => {});
        await mainPage.page.getByRole('button', { name: 'แก้ไขไซต์งาน', exact: true }).click().catch(() => {});
        await editProject.deleteProject().catch(() => {});
    }
    projectsToDelete = [];
  });

  test('Delete › Existing Project › Success & Removed', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `DeleteLifecycle_${uniqueId}`;
    
     // Create project
    await projectForm.createNewProject({
      name: projectName,
      location: 'Decommissioning Hub',
    });
    projectsToDelete.push(projectName);
    
    // Verify creation - Wait for SweetAlert and click OK to ensure clean state
    const swalTitle = page.locator('.swal2-title, #swal2-title');
    await expect(swalTitle).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(swalTitle).not.toBeVisible();

    // Execute Deletion
    await projectPage.clickProjectByName(projectName);
    await page.getByRole('button', { name: 'แก้ไขไซต์งาน', exact: true }).click();
    await editProject.deleteProject();

    // Verify removed from dashboard
    await expect(page.getByText(projectName)).not.toBeVisible();
    
    // Remove from manual cleanup queue as already deleted successfully
    projectsToDelete = projectsToDelete.filter(p => p !== projectName);
  });

  test('Safety › Cancel Deletion › Record Persists', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `SafetyStay_${uniqueId}`;
    
    await projectForm.createNewProject({
      name: projectName,
      location: 'Safe Zone',
    });
    projectsToDelete.push(projectName);

    // Trigger Delete but Cancel
    await projectPage.clickProjectByName(projectName);
    await page.getByRole('button', { name: 'แก้ไขไซต์งาน', exact: true }).click();
    
    // Click delete to trigger dialog
    await page.getByRole('button', { name: 'ลบไซต์งาน', exact: true }).click();
    
    // Safety Action: Click Cancel on SweetAlert
    await page.getByRole('button', { name: 'No, keep it', exact: false }).click();
    
    await mainPage.navigate();
    await expect(page.getByText(projectName)).toBeVisible();
  });
});
