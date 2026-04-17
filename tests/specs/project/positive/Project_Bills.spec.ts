import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { ProjectPage } from '../../../pages/project/ProjectPage';
import { ProjectFormPage } from '../../../pages/project/ProjectFormPage';
import { EditProjectPage } from '../../../pages/project/EditProjectPage';
import { ExpenseFormPage } from '../../../pages/income_expenses/ExpenseFormPage';

test.describe('Project › Billing', () => {
  let mainPage: MainPage;
  let projectPage: ProjectPage;
  let projectForm: ProjectFormPage;
  let editProject: EditProjectPage;
  let expenseForm: ExpenseFormPage;
  let projectsToDelete: string[] = [];

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    projectPage = new ProjectPage(page);
    projectForm = new ProjectFormPage(page);
    editProject = new EditProjectPage(page);
    expenseForm = new ExpenseFormPage(page);

    await mainPage.navigate();
  });

  test.afterEach(async () => {
    // Robust cleanup for isolated test projects
    await mainPage.navigate();

    for (const name of projectsToDelete) {
        await projectPage.clickProjectByName(name).catch(() => {});
        await mainPage.page.getByRole('button', { name: 'แก้ไขไซต์งาน', exact: true }).click().catch(() => {});
        await editProject.deleteProject().catch(() => {});
    }
    projectsToDelete = [];
  });

  test('Create › Project Expense › Record Verified', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const projectName = `BillProj_${uniqueId}`;
    
    const billData = {
      expenseType: 'Materials',
      date: '2026-04-15',
      amount: '100',
      storeName: 'AutoStore',
    };

    // Requirement: Setup isolated project for the billing test
    await projectForm.createNewProject({
      name: projectName,
      location: 'Billing Sandbox',
    });
    projectsToDelete.push(projectName);

    // Navigate to project bill management
    await projectPage.clickProjectByName(projectName);
    await projectPage.clickExpenseTab();

    // Populate and submit the expense bill form
    await expenseForm.openCreateForm();
    await expenseForm.fillForm(billData);
    await expenseForm.submit();

    // Assert successful record creation
    await expect(page.locator('#swal2-title')).toBeVisible();
  });
});
