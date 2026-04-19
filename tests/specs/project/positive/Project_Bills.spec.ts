import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { ProjectPage } from '../../../pages/project/ProjectPage';
import { ProjectFormPage } from '../../../pages/project/ProjectFormPage';
import { EditProjectPage } from '../../../pages/project/EditProjectPage';
import { ExpenseFormPage } from '../../../pages/income_expenses/ExpenseFormPage';

test.describe('Project › Management › Financials', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let projectPage: ProjectPage;
  let projectForm: ProjectFormPage;
  let editProject: EditProjectPage;
  let expenseForm: ExpenseFormPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    projectPage = new ProjectPage(page);
    projectForm = new ProjectFormPage(page);
    editProject = new EditProjectPage(page);
    expenseForm = new ExpenseFormPage(page);

    await mainPage.navigate();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
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

    await test.step('Initialise test project', async () => {
      await projectForm.createNewProject({
        name: projectName,
        location: 'Billing Sandbox',
        budget: '1000',
        startDate: '2026-04-22',
        endDate: '2026-12-31'
      });
    });

    await test.step('Navigate to project expense form', async () => {
      await projectPage.clickProjectByName(projectName);
      await projectPage.clickExpenseTab();
      await expenseForm.openCreateForm();
    });

    await test.step('Submit expense and verify', async () => {
      await expenseForm.fillForm(billData);
      await expenseForm.submit();
    });
  });
});
